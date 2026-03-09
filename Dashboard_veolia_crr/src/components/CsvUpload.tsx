import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { parseCSV } from "@/lib/csv-parser";
import { clearData } from "@/lib/data-store";
import { importOrdensServico } from "@/services/importService";
import { Button } from "@/components/ui/button";

interface CsvUploadProps {
  onUploaded?: (data: any[]) => void;
}

export function CsvUpload({ onUploaded }: CsvUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [replaceAll, setReplaceAll] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setStatus("error");
      setMessage("Apenas arquivos CSV são aceitos.");
      return;
    }
    setStatus("loading");
    setMessage(replaceAll ? "Substituindo todos os dados..." : "Processando e enviando dados...");
    try {
      const data = await parseCSV(file);
      if (data.length === 0) {
        setStatus("error");
        setMessage("Nenhum registro válido encontrado no arquivo.");
        return;
      }

      if (replaceAll) {
        await clearData();
      }

      const result = await importOrdensServico(data);
      if (!result.success) {
        setStatus("error");
        setMessage(`Erro: ${result.error?.message ?? "Falha ao importar."}`);
        return;
      }

      setStatus("success");
      setMessage(
        replaceAll
          ? `${data.length} ordens de serviço importadas (dados anteriores substituídos).`
          : `${data.length} ordens de serviço adicionadas ou atualizadas (sem duplicar por número de ordem).`
      );
      onUploaded?.(data);
    } catch (e) {
      setStatus("error");
      setMessage("Erro ao processar o arquivo CSV.");
    }
  }, [onUploaded, replaceAll]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={replaceAll}
          onChange={(e) => setReplaceAll(e.target.checked)}
          className="rounded border-border"
        />
        <span className="text-sm text-foreground">
          <strong>Substituir todos os dados</strong> — apaga todas as ordens na base e importa só este CSV (evita duplicados).
        </span>
      </label>
      <p className="text-xs text-muted-foreground">
        Se desmarcado: adiciona novas ordens e atualiza as existentes pelo número da ordem (não duplica).
      </p>
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-foreground font-medium mb-1">Arraste o arquivo CSV aqui</p>
        <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
        <label>
          <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
          <Button variant="outline" asChild>
            <span className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </span>
          </Button>
        </label>
      </div>

      {status !== "idle" && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
            status === "success"
              ? "bg-kpi-green/10 text-kpi-green border border-kpi-green/20"
              : status === "error"
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-accent/10 text-accent border border-accent/20"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : status === "error" ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          ) : null}
          <span className="text-sm">{message}</span>
        </div>
      )}
    </div>
  );
}
