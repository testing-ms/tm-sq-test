import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecordQueries } from '@/services/alma/MedicalRecord/queries';
import { MedicalRecordData, MedicalRecordResponse } from '@/services/alma/MedicalRecord/types';
import { toast } from 'sonner';
import { debounce } from 'lodash';

export const useMedicalRecordDraft = (
  appointmentId: string,
  initialMedicalRecord?: MedicalRecordResponse
) => {
  const [localDraft, setLocalDraft] = useState<MedicalRecordData | null>(
    initialMedicalRecord ? {
      ...initialMedicalRecord,
      appointmentId,
      isDraft: true,
    } : null
  );
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['medicalRecordDraft', appointmentId],
    queryFn: () => MedicalRecordQueries.getDraft(appointmentId),
    enabled: !!appointmentId && !initialMedicalRecord,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (initialMedicalRecord) return;

    if (data && !localDraft) {
      setLocalDraft(data);
    } else if (!isLoading && !localDraft) {
      setLocalDraft({
        appointmentId,
        motivos: '',
        anamnesisRemota: '',
        anamnesisProxima: '',
        examenFisico: {},
        diagnostico: '',
        recetaMedica: '',
        indicaciones: '',
        derivaciones: [],
        certificado: '',
        isDraft: true,
        lastModified: new Date(),
      });
    }
  }, [data, isLoading, appointmentId, localDraft, initialMedicalRecord]);

  const { mutate: saveDraft } = useMutation({
    mutationFn: MedicalRecordQueries.saveDraft,
    onMutate: async (newDraft) => {
      setIsSaving(true);
      queryClient.setQueryData(['medicalRecordDraft', appointmentId], newDraft);
    },
    onSettled: () => {
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('Error al guardar el borrador:', error);
      toast.error('Error al guardar el borrador de la ficha médica');
      queryClient.invalidateQueries({ queryKey: ['medicalRecordDraft', appointmentId] });
    },
  });

  const saveImmediately = useCallback(async () => {
    if (!localDraft) return null;

    try {
      setIsSaving(true);
      const updatedDraft = {
        ...localDraft,
        lastModified: new Date()
      };

      const result = await MedicalRecordQueries.saveDraft(updatedDraft);
      queryClient.setQueryData(['medicalRecordDraft', appointmentId], result);
      return result;
    } catch (error) {
      console.error('Error al guardar inmediatamente el borrador:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [localDraft, appointmentId, queryClient]);

  const debouncedSave = useCallback(
    debounce((data: MedicalRecordData) => {
      if (!isSaving) {
        saveDraft(data);
      }
    }, 5000),
    [saveDraft, isSaving]
  );

  const updateDraft = useCallback((updates: Partial<MedicalRecordData>) => {
    setLocalDraft((prev) => {
      if (!prev) return null;

      const newDraft = {
        ...prev,
        ...updates,
        lastModified: new Date(),
        isDraft: true,
      };

      if (!initialMedicalRecord) {
        debouncedSave(newDraft);
      }

      return newDraft;
    });
  }, [debouncedSave, initialMedicalRecord]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const { mutate: deleteDraftMutation } = useMutation({
    mutationFn: MedicalRecordQueries.deleteDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecordDraft', appointmentId] });
      setLocalDraft(null);
      toast.success('Borrador eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar el borrador');
    },
  });

  const refetchDraft = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['medicalRecordDraft', appointmentId] });
  }, [queryClient, appointmentId]);

  return {
    draft: localDraft,
    isLoading: isLoading && !initialMedicalRecord,
    updateDraft,
    saveImmediately,
    cancelPendingSave: () => debouncedSave.cancel(),
    deleteDraft: () => deleteDraftMutation(appointmentId),
    refetch: refetchDraft,
  };
};