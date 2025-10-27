"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { IApprovalWorkflow } from "@/types/admin";

interface IWorkflowModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (workflow: Omit<IApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'> | Partial<IApprovalWorkflow>) => void;
  readonly workflow?: IApprovalWorkflow;
}

const WorkflowModal = ({ isOpen, onClose, onSubmit, workflow }: IWorkflowModalProps): JSX.Element => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
      setIsActive(workflow.isActive);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
    }
  }, [workflow, isOpen]);

  const handleSubmit = (): void => {
    if (!name.trim()) return;
    
    const workflowData = {
      name: name.trim(),
      description: description.trim(),
      isActive,
      rules: workflow?.rules || []
    };
    
    onSubmit(workflow ? { ...workflowData, id: workflow.id } : workflowData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {workflow ? "Rediger godkjenningsflyt" : "Opprett ny godkjenningsflyt"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Navn
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="F.eks. Skolebookinger"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beskrivelse
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Beskriv hva denne flyten gjelder for..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              Aktiv
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {workflow ? "Lagre endringer" : "Opprett flyt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;