"use client";

import React from "react";
import { MessageInbox } from "@/components/features/messaging/components/MessageInbox";

const AdminMessages: React.FC = () => {
  return (
    <div className="fixed inset-0 top-20 left-64 right-0 bottom-0 overflow-hidden">
      <MessageInbox
        userId="landlord-1"
        showThreadView={true}
        currentUserType="landlord"
      />
    </div>
  );
};

export default AdminMessages;
