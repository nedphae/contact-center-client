/* eslint-disable import/no-cycle */
import RenderAuthorize from 'app/components/Authorized';
import { getAuthority } from './authority';
/* eslint-disable import/no-mutable-exports */
let Authorized = RenderAuthorize(getAuthority());
// Reload the rights component
const reloadAuthorized = (): void => {
  Authorized = RenderAuthorize(getAuthority());
};

/**
 * hard code
 * block need it。
 */
window.reloadAuthorized = reloadAuthorized;

export { reloadAuthorized };
export default Authorized;
