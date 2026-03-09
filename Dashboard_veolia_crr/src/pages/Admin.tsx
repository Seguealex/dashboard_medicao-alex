import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Trash2 } from "lucide-react";
import { CsvUpload } from "@/components/CsvUpload";
import { loadData, clearData, saveData } from "@/lib/data-store";
import { Button } from "@/components/ui/button";
import type { OrdemServico } from "@/lib/types";

const Admin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<OrdemServico[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadData();
      setData(data);
    };
    fetchData();
  }, []);

  const handleUploaded = (newData: OrdemServico[]) => {
    setData(newData);
    saveData(newData);
  };

  const handleClear = () => {
    clearData();
    setData([]);
  };

  return (
    <div className="min-h-screen">
      <header className="dashboard-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Administração</span>
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Importar Dados</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Faça upload de um arquivo CSV (UTF-8) com as colunas: Ordem de Serviço, Descrição, Local, Ativo, Status, Início Previsto, Tipo de Serviço, Término Efetivo.
          </p>
          <CsvUpload onUploaded={handleUploaded} />
        </div>

        {data.length > 0 && (
          <div className="kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dados atuais</p>
                <p className="text-2xl font-bold text-foreground">{data.length.toLocaleString("pt-BR")} ordens</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-1" /> Limpar dados
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
