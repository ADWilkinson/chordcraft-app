import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionButton?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionButton
}) => (
  <div className="text-center py-12  rounded-md border border-[#877a74]/20 shadow-sm">
    <div className="mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-[#f9f5f1] mb-2">{title}</h3>
    <p className="text-[#f9f5f1]/70 mb-4">{description}</p>
    {actionButton}
  </div>
);

export default EmptyState;
