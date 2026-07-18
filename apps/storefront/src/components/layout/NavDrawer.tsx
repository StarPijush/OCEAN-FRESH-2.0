import { useNavigate } from 'react-router-dom';

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NavDrawer({ open, onClose }: NavDrawerProps) {
  const navigate = useNavigate();

  function go(page: string) {
    navigate(page === 'home' ? '/' : `/${page}`);
    onClose();
  }

  return (
    <div id="nav-drawer" className={open ? 'open' : ''}>
      <div className="drawer-link" onClick={() => go('home')}>
        Home <sup>01</sup>
      </div>
      <div className="drawer-link" onClick={() => go('products')}>
        Products <sup>02</sup>
      </div>
      <div className="drawer-link" onClick={() => go('order')}>
        Order <sup>03</sup>
      </div>
      <div className="drawer-link" onClick={() => go('contact')}>
        Contact <sup>04</sup>
      </div>
      <div className="drawer-footer">
        &copy; OceanFresh &middot; Jhargram &middot; Fresh since 2018
      </div>
    </div>
  );
}
