import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="rating-stars">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const Avatar = ({ name, avatar, size = 'sm' }) => {
  const cls = size === 'lg' ? 'expert-avatar-lg' : 'expert-avatar';
  const fallbackCls = size === 'lg' ? 'expert-avatar-lg-fallback' : 'expert-avatar-fallback';

  if (avatar) return <img src={avatar} alt={name} className={cls} onError={(e) => e.target.style.display = 'none'} />;
  return <div className={fallbackCls}>{name?.charAt(0)}</div>;
};

export { Avatar, StarRating };

export default function ExpertCard({ expert }) {
  const navigate = useNavigate();

  return (
    <div className="card expert-card" onClick={() => navigate(`/experts/${expert._id}`)}>
      <div className="expert-card-header">
        <Avatar name={expert.name} avatar={expert.avatar} />
        <div style={{ flex: 1 }}>
          <div className="expert-category">{expert.category}</div>
          <div className="expert-name">{expert.name}</div>
        </div>
        <div className="rate-badge">${expert.hourlyRate}<span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>/hr</span></div>
      </div>

      <p className="expert-bio">{expert.bio}</p>

      <div className="expert-meta">
        <span className="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {expert.experience} yrs
        </span>
        <span className="meta-item">
          <StarRating rating={expert.rating} />
          {expert.rating} ({expert.totalReviews})
        </span>
      </div>

      {expert.skills?.length > 0 && (
        <div className="expert-skills">
          {expert.skills.slice(0, 3).map((s) => (
            <span key={s} className="skill-tag">{s}</span>
          ))}
          {expert.skills.length > 3 && <span className="skill-tag">+{expert.skills.length - 3}</span>}
        </div>
      )}
    </div>
  );
}
