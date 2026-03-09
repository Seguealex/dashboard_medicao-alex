import { supabase } from './supabase';
import { importOrdensServico } from '@/services/importService';
import type { OrdemServico, StatusCode, TipoServicoCode } from './types';

const PAGE_SIZE = 1000;

function mapRow(item: Record<string, unknown>): OrdemServico {
  return {
    ordemServico: (item.ordem_servico as string) ?? '',
    descricao: (item.descricao as string) ?? '',
    local: (item.local as string) ?? '',
    ativo: (item.ativo as string) ?? '',
    status: ((item.status_codigo as string) || 'OTHER') as StatusCode,
    inicioPrevisto: (item.inicio_previsto as string) ?? '',
    tipoServico: ((item.tipo_servico as string) || 'OTHER') as TipoServicoCode,
    terminoEfetivo: (item.termino_efetivo as string) ?? '',
  };
}

export async function loadData(): Promise<OrdemServico[]> {
  try {
    const allRows: OrdemServico[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('id', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...data.map(mapRow));
      offset += data.length;
      if (data.length < PAGE_SIZE) hasMore = false;
    }

    return allRows;
  } catch (error) {
    console.error('Failed to load data from Supabase', error);
    return [];
  }
}

export async function clearData(): Promise<void> {
  try {
    // Delete all records (requires caution, usually done by deleting where id is not null)
    const { error } = await supabase.from('ordens_servico').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  } catch (error) {
    console.error('Failed to clear data from Supabase', error);
  }
}

export async function saveData(data: OrdemServico[]): Promise<void> {
  try {
    const mappedData = data.map(item => ({
      ordem_servico: item.ordemServico,
      descricao: item.descricao,
      local: item.local,
      ativo: item.ativo,
      status_codigo: item.status,
      inicio_previsto: item.inicioPrevisto,
      tipo_servico: item.tipoServico,
      termino_efetivo: item.terminoEfetivo,
    }));
    await importOrdensServico(mappedData);
  } catch (error) {
    console.error('Failed to save data to Supabase', error);
  }
}
