import { FieldMapping, UserField } from '@/app/shared/types';
import { useMappingState } from './review/useMappingState';
import { useMappingSections } from './review/useMappingSections';
import { useMappingTranslations } from './review/useMappingTranslations';
import { useMappingSave } from './review/useMappingSave';

type UseReviewMappingsProps = {
  initialMappings: FieldMapping[];
  fromLanguage: string;
  onConfirm: (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => void;
  defaultLang?: string;
};

export const useReviewMappings = ({
  initialMappings,
  fromLanguage,
  onConfirm,
  defaultLang = 'en'
}: UseReviewMappingsProps) => {
  const mappingState = useMappingState(initialMappings);
  const sections = useMappingSections(initialMappings);

  const translations = useMappingTranslations({
    editedMappings: mappingState.editedMappings,
    setEditedMappings: mappingState.setEditedMappings,
    fromLanguage,
    defaultLang
  });

  const savePrompt = useMappingSave({
    editedMappings: mappingState.editedMappings,
    missingIndices: sections.missingIndices,
    onConfirm
  });

  return {
    ...mappingState,
    ...sections,
    ...translations,
    ...savePrompt
  };
};
