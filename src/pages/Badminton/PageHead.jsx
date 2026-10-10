import React from 'react';

// Simple page title (no banner / no image)
export default function PageHead({ title, sub }) {
  return (
    <div className="bd-ph">
      <i className="bd-ph-bar" />
      <div>
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>
    </div>
  );
}