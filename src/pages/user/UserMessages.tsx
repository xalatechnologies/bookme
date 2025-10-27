"use client";

import React from "react";
import { MessageInbox } from "@/components/features/messaging/components/MessageInbox";

const UserMessages: React.FC = () => {
  return (
    <div className="fixed inset-0 top-20 left-64 right-0 bottom-0 overflow-hidden">
      <MessageInbox
        userId="tenant-1"
        showThreadView={true}
        currentUserType="tenant"
      />
    </div>
  );
};

export default UserMessages;
