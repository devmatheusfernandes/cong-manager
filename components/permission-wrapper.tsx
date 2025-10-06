"use client";

import { useAuth } from "@/components/auth-provider";
import { canEdit, canView } from "@/lib/auth";
import { ReactNode } from "react";

interface PermissionWrapperProps {
  section: string;
  action: 'view' | 'edit';
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionWrapper({ 
  section, 
  action, 
  children, 
  fallback = null 
}: PermissionWrapperProps) {
  const { user } = useAuth();

  const hasPermission = action === 'edit' 
    ? canEdit(user, section) 
    : canView(user, section);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface EditableContentProps {
  section: string;
  children: ReactNode;
  readOnlyContent?: ReactNode;
}

export function EditableContent({ 
  section, 
  children, 
  readOnlyContent 
}: EditableContentProps) {
  const { user } = useAuth();
  const canEditSection = canEdit(user, section);

  if (!canEditSection && readOnlyContent) {
    return <>{readOnlyContent}</>;
  }

  if (!canEditSection) {
    return null;
  }

  return <>{children}</>;
}