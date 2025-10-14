"use client";

import React from "react";
import { MessageInbox } from "@/components/messaging/MessageInbox";

const UserMessages: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6">
      <MessageInbox
        userId="tenant-1"
        showThreadView={true}
        currentUserType="tenant"
      />
    </div>
  );
};

export default UserMessages;
