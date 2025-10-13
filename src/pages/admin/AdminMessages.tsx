"use client";

import React from "react";
import { MessageInbox } from "@/components/messaging/MessageInbox";

const AdminMessages: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6">
      <MessageInbox
        userId="landlord-1"
        showThreadView={true}
        currentUserType="landlord"
      />
    </div>
  );
};

export default AdminMessages;
