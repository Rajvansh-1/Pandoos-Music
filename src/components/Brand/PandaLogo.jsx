import './PandaLogo.css';

export default function PandaLogo({ size = 40, className = '' }) {
  return (
    <div className={`panda-logo-container ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="panda-svg">
        {/* Ambient Glow Behind Panda */}
        <circle cx="50" cy="50" r="40" className="panda-ambient-glow" />
        
        {/* Glass Face Base */}
        <path d="M50 15C25 15 10 35 10 55C10 75 25 90 50 90C75 90 90 75 90 55C90 35 75 15 50 15Z" className="panda-face-glass" />
        
        {/* Ears */}
        <circle cx="25" cy="25" r="15" className="panda-ear left-ear" />
        <circle cx="75" cy="25" r="15" className="panda-ear right-ear" />
        
        {/* Eye Patches (Dark Glass) */}
        <path d="M25 45C25 35 40 40 40 55C40 70 25 65 25 45Z" className="panda-eye-patch left-patch" />
        <path d="M75 45C75 35 60 40 60 55C60 70 75 65 75 45Z" className="panda-eye-patch right-patch" />
        
        {/* Glowing Eyes */}
        <circle cx="32" cy="50" r="4" className="panda-eye-glow left-eye" />
        <circle cx="68" cy="50" r="4" className="panda-eye-glow right-eye" />
        
        {/* Nose */}
        <path d="M45 65L55 65L50 70L45 65Z" className="panda-nose" />
        
        {/* Smile */}
        <path d="M40 75Q50 85 60 75" className="panda-smile" />
      </svg>
    </div>
  );
}
