'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/app/shared/components/AppHeader';
import { Button } from '@/app/shared/components/Button';
import { EditableText } from '@/app/shared/components/EditableText';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/shared/components/Modal';
import { StatusOverlay } from '@/app/shared/components/StatusOverlay';
import { Stepper } from '@/app/features/autofill-wizard/components/Stepper';
import { CheckIcon, CloseIcon, SearchIcon, UserIcon, EditSquareIcon } from '@/icons';

const ComponentsPage = () => {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusOverlayOpen, setIsStatusOverlayOpen] = useState(false);
  const [editableText, setEditableText] = useState('Click to edit me');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Component Library</h1>
          <p className="text-slate-500">A Storybook-like showcase of all UI components used in the application.</p>
        </div>

        {/* --- Typography / EditableText --- */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">EditableText</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">As Paragraph (Default)</p>
              <EditableText 
                value={editableText} 
                onSave={setEditableText} 
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">As H2 Heading</p>
              <EditableText 
                as="h2"
                textClassName="text-2xl font-bold"
                value="Heading Editable Text"
                onSave={() => {}} 
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">With Placeholder</p>
              <EditableText 
                value="" 
                placeholder="Enter some text here..."
                onSave={() => {}} 
              />
            </div>
          </div>
        </section>

        {/* --- Buttons --- */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Buttons</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-end gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Icon only">
                  <SearchIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">States & Icons</h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button isLoading>Loading</Button>
                <Button leftIcon={<UserIcon className="w-4 h-4" />}>Left Icon</Button>
                <Button rightIcon={<CheckIcon className="w-4 h-4" />}>Right Icon</Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Stepper --- */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Stepper</h2>
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-4">Step 1 Active</p>
              <Stepper currentStep={1} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-4">Step 2 Active</p>
              <Stepper currentStep={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-4">Step 3 Active (Completed)</p>
              <Stepper currentStep={3} />
            </div>
          </div>
        </section>

        {/* --- Overlays & Modals --- */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Overlays & Modals</h2>
          <div className="flex gap-4">
            <Button onClick={() => setIsModalOpen(true)}>Open Standard Modal</Button>
            <Button onClick={() => setIsStatusOverlayOpen(true)} variant="secondary">Open Status Overlay</Button>
          </div>
        </section>
      </div>

      {/* --- Actual Modals --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>
          <h3 className="text-xl font-bold text-slate-800">Example Modal</h3>
          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </ModalHeader>
        <ModalBody>
          <p className="text-slate-600 mb-4">
            This is a standard modal component. It uses <code>ModalHeader</code>, <code>ModalBody</code>, and <code>ModalFooter</code> subcomponents to structure the content consistently.
          </p>
          <p className="text-slate-600">
            You can put any interactive content inside the body.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={() => setIsModalOpen(false)}>Confirm Action</Button>
        </ModalFooter>
      </Modal>

      {isStatusOverlayOpen && (
        <StatusOverlay 
          status={{ step: 'processing', message: 'Analyzing document using AI...' }} 
          onClose={() => setIsStatusOverlayOpen(false)} 
        />
      )}
    </div>
  );
};

export default ComponentsPage;
