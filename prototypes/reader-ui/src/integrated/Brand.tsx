import { Link } from 'react-router-dom';
export function Brand() {
  return <Link to="/books" className="rd-brand" aria-label="Readict 首页"><span className="rd-brand-mark" aria-hidden="true">r</span><span>Readict</span></Link>;
}
