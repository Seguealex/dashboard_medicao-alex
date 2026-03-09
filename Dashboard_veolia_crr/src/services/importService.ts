import { supabase } from '../lib/supabase';

// Defines the structure of the data expected to be imported from the CSV.
// This interface matches the 'ordens_servico' table schema.
export interface OrdemServicoData {
  ordem_servico: string;
  descricao?: string;
  local?: string;
  ativo?: string;
  status_codigo?: string;
  tipo_servico?: string;
  inicio_previsto?: string | null; // ISO Date string (YYYY-MM-DD)
  termino_efetivo?: string | null; // ISO Date string (YYYY-MM-DD)
}

/**
 * Upserts an array of CSV data into the public.ordens_servico table.
 * Records with matching 'ordem_servico' will be updated; new records will be inserted.
 * 
 * @param data Array of objects mapping to the ordens_servico columns
 * @returns Result object indicating success or failure along with any error details
 */
export async function importOrdensServico(data: OrdemServicoData[]) {
  try {
    const { data: result, error } = await supabase
      .from('ordens_servico')
      .upsert(data, { 
        onConflict: 'ordem_servico',
        ignoreDuplicates: false // Ensures existing records are updated rather than ignored
      });

    if (error) {
      console.error('Error importing CSV data:', error);
      return { success: false, error };
    }

    return { success: true, count: data.length, data: result };
  } catch (err) {
    console.error('Unexpected error during import:', err);
    return { success: false, error: err };
  }
}
