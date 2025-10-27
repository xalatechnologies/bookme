import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IApprovalWorkflow } from '@/types/admin';

interface IApprovalWorkflowStore {
  workflows: IApprovalWorkflow[];
  addWorkflow: (workflow: Omit<IApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflow: (id: string, workflow: Partial<IApprovalWorkflow>) => void;
  deleteWorkflow: (id: string) => void;
  getWorkflowById: (id: string) => IApprovalWorkflow | undefined;
  getActiveWorkflows: () => IApprovalWorkflow[];
  toggleWorkflowStatus: (id: string) => void;
}

export const useApprovalWorkflowStore = create<IApprovalWorkflowStore>()(
  persist(
    (set, get) => ({
      workflows: [
        {
          id: '1',
          name: 'Skolebookinger',
          description: 'Automatisk godkjenning for skoler',
          isActive: true,
          rules: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Idrettslag',
          description: 'Manuell godkjenning påkrevd',
          isActive: true,
          rules: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Kommersiell leie',
          description: 'Godkjenning av saksbehandler påkrevd',
          isActive: true,
          rules: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      
      addWorkflow: (workflowData) => set((state) => {
        const newWorkflow: IApprovalWorkflow = {
          ...workflowData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { workflows: [...state.workflows, newWorkflow] };
      }),
      
      updateWorkflow: (id, workflowData) => set((state) => ({
        workflows: state.workflows.map(workflow => 
          workflow.id === id 
            ? { ...workflow, ...workflowData, updatedAt: new Date().toISOString() } 
            : workflow
        )
      })),
      
      deleteWorkflow: (id) => set((state) => ({
        workflows: state.workflows.filter(workflow => workflow.id !== id)
      })),
      
      getWorkflowById: (id) => get().workflows.find(workflow => workflow.id === id),
      
      getActiveWorkflows: () => get().workflows.filter(workflow => workflow.isActive),
      
      toggleWorkflowStatus: (id) => set((state) => ({
        workflows: state.workflows.map(workflow => 
          workflow.id === id 
            ? { ...workflow, isActive: !workflow.isActive, updatedAt: new Date().toISOString() } 
            : workflow
        )
      }))
    }),
    {
      name: 'approval-workflows-storage'
    }
  )
);