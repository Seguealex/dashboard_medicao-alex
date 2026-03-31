// src/components/ExcelUpload.tsx
// Componente de upload que aceita .xlsx, .xls e .csv
// Lê todas as abas e popula o ExcelContext
import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { parseExcelFile, isSupportedFile } from "@/lib/excel-parser";
import { processarFaturamentoExcel } from "@/lib/faturamento-parser";
import { supabase } from "@/lib/supabase";
import { useExcel } from "@/contexts/ExcelContext";
import { Button } from "@/components/ui/button";

export function ExcelUpload() {
  const { setSheets, clearSheets } = useExcel();
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [replaceAll, setReplaceAll] = useState(true);

  const processFile = useCallback(async (file: File) => {
    if (!isSupportedFile(file)) {
      setStatus("error");
      setMessage("Formato não suportado. Use .xlsx, .xls ou .csv.");
      return;
    }

    setStatus("loading");
    setMessage("Lendo arquivo e processando abas...");

    try {
      if (replaceAll) clearSheets();

      const { sheets, rawSheets } = await parseExcelFile(file);
      const sheetNames = Object.keys(sheets);
      const totalRows = sheetNames.reduce((acc, s) => acc + sheets[s].length, 0);

      setSheets(sheets, rawSheets, file.name);

      try {
        const { boletim, especificacoes, mesesEspecificacoes } = processarFaturamentoExcel(rawSheets);
        
        if (replaceAll) {
          setMessage("Limpando dados antigos no banco...");
          // Limpar Medições
          const { error: deleteError } = await supabase
            .from('medicoes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); 

          if (deleteError) throw deleteError;

          // Limpar Especificações
          await supabase.from('especificacoes_meses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('especificacoes_valores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

        setMessage("Salvando novos dados no banco...");
        
        // Inserir Medições (Boletim)
        const { error: insertError } = await supabase
          .from('medicoes')
          .insert(boletim);
        if (insertError) throw insertError;

        // Inserir Cabeçalho de Meses das Especificações
        if (mesesEspecificacoes.length > 0) {
          const { error: mesesError } = await supabase
            .from('especificacoes_meses')
            .insert(mesesEspecificacoes.map((mes, i) => ({ mes_nome: mes, ordem: i })));
          if (mesesError) throw mesesError;
        }

        // Inserir Valores das Especificações
        if (especificacoes.length > 0) {
          const valoresToInsert = especificacoes.flatMap(spec => 
            spec.valoresPorMes.map(v => ({
              tipo_servico: spec.tipoServico,
              mes_nome: v.mes,
              valor: v.valor
            }))
          );
          
          if (valoresToInsert.length > 0) {
            const { error: valoresError } = await supabase
              .from('especificacoes_valores')
              .insert(valoresToInsert);
            if (valoresError) throw valoresError;
          }
        }

        setStatus("success");
        const specValoresCount = especificacoes.flatMap(s => s.valoresPorMes).length;
        setMessage(
          `✅ ${file.name} — ${sheetNames.join(", ")} processado. ` +
          `Inseridos: ${boletim.length} boletins, ${mesesEspecificacoes.length} meses e ${specValoresCount} valores de especificações.`
        );
      } catch (dbErr: any) {
        console.error("Erro ao integrar com Supabase:", dbErr);
        throw new Error("Falha ao salvar no banco de dados: " + (dbErr.message || ""));
      }
    } catch (err: unknown) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      setMessage(`Erro ao processar o arquivo: ${msg}`);
    }
  }, [setSheets, clearSheets, replaceAll]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input para permitir reenviar o mesmo arquivo
    e.target.value = "";
  }, [processFile]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Opção substituir */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={replaceAll}
          onChange={(e) => setReplaceAll(e.target.checked)}
          className="rounded border-border"
        />
        <span className="text-sm text-foreground">
          <strong>Substituir dados atuais</strong> — descarta arquivo anterior ao carregar um novo.
        </span>
      </label>

      {/* Área de drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 cursor-pointer ${
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-foreground font-medium mb-1">
          Arraste o arquivo Excel ou CSV aqui
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Suporta <strong>.xlsx</strong>, <strong>.xls</strong> e <strong>.csv</strong>
        </p>
        <label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button variant="outline" asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </span>
          </Button>
        </label>
      </div>

      {/* Feedback */}
      {status !== "idle" && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 text-sm ${
            status === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : status === "error"
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-accent/10 text-accent border border-accent/20"
          }`}
        >
          {status === "loading" && <Loader2 className="h-4 w-4 flex-shrink-0 mt-0.5 animate-spin" />}
          {status === "success" && <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />}
          {status === "error" && <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
