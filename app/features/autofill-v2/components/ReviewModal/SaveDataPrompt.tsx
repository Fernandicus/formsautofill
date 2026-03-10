import React from 'react';
import { FieldMapping, UserField } from '@/app/shared/types';
import { FieldItem } from '@/app/features/profile/components/DataProfile/FieldItem';
import { SaveDataIcon } from '../../../../../icons';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/shared/components/Modal';
import { Button } from '@/app/shared/components/Button';

type SaveDataPromptProps = {
  fieldsToSave: UserField[];
  editedMappings: FieldMapping[];
  onConfirm: (withSave: boolean) => void;
  updateFieldToSave: (index: number, key: string, value: string) => void;
  removeFieldToSave: (id: string) => void;
};

export const SaveDataPrompt: React.FC<SaveDataPromptProps> = ({
  fieldsToSave,
  onConfirm,
  updateFieldToSave,
  removeFieldToSave
}) => {
  return (
    <Modal maxWidth="max-w-md" className="max-h-[90vh] rounded-3xl text-center" isOpen={true}>
          <ModalHeader className="flex-col justify-center border-b-0 pb-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SaveDataIcon className="w-8 h-8"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Save New Data?</h3>
              <p className="text-sm text-slate-500">
                You filled out <span className="font-bold text-indigo-600">{fieldsToSave.length}</span> new field(s). Modify their labels below if needed, and store them for future use.
              </p>
          </ModalHeader>

          <ModalBody className="px-6 pb-2 space-y-3 text-left w-full h-full bg-white">
            {fieldsToSave.map((field, idx) => (
              <FieldItem 
                key={field.id}
                field={field}
                onUpdate={(key, value) => updateFieldToSave(idx, key, value)}
                onRemove={() => removeFieldToSave(field.id)}
              />
            ))}
          </ModalBody>

          <ModalFooter className="pt-4 justify-center border-t border-slate-50">
              <Button 
                variant="outline"
                onClick={() => onConfirm(false)}
                className="rounded-xl"
              >
                No, just generate
              </Button>
              <Button 
                variant="primary"
                onClick={() => onConfirm(true)}
                className="rounded-xl shadow-indigo-600/30 active:scale-95"
              >
                Yes, store it
              </Button>
          </ModalFooter>
      </Modal>
  );
};
