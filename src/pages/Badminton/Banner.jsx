import React from 'react';
import { useGet, img } from './bdApi';

// section: home|tournament|team|players|live|schedule|match|points   override: specific image (match/tournament banner)
// Image is always shown in full (no cropping) on any screen size: blurred fill behind + object-fit: contain in front.
export default function Banner({ section, title, sub, override }) {
  const { data } = useGet(section ? `/banners?section=${section}` : null);
  const b = data && data[0];
  const src = override || (b && b.image);
  const t = (!override && b && b.title) || title;
  const s = (!override && b && b.subtitle) || sub;
  const Wrap = ({ children }) => (b && b.link && !override ? <a className="bdb-link" href={b.link} target="_blank" rel="noreferrer">{children}</a> : <>{children}</>);
  return (
    <Wrap>
      <div className={`bdb ${src ? 'has-img' : 'no-img'}`}>
        {src && (
          <div className="bdb-stage">
            <img className="bdb-bg" src={img(src)} alt="" aria-hidden="true" />
            <img className="bdb-img" src={img(src)} alt={t || ''} />
          </div>
        )}
        <div className="bdb-t"><h1>{t}</h1>{s && <p>{s}</p>}</div>
      </div>
    </Wrap>
  );
}