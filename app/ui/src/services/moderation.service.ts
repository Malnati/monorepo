// app/ui/src/services/moderation.service.ts
import api from './api';

const CHECK_PUBLICATION_ENDPOINT = '/moderation/publications';

interface CheckPublicationData {
  titulo: string;
  descricao: string;
  categoria?: string;
}

interface CheckPublicationResponse {
  status: 'approved' | 'needs_revision' | 'blocked';
  reason: string;
  issues: string[];
  suggestions?: string[];
}

/**
 * Verifica publicação usando moderação por IA
 */
export const checkPublication = async (
  data: CheckPublicationData,
): Promise<CheckPublicationResponse> => {
  const response = await api.post<CheckPublicationResponse>(
    CHECK_PUBLICATION_ENDPOINT,
    data,
  );
  return response.data;
};
