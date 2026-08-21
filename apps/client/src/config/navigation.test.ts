import { createClientNavigation, createGuestNavigation } from './navigation';

describe('createClientNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the primary sections and logo without a user block when no user is given', () => {
    const config = createClientNavigation();

    const keys = (config.sections[0]?.items ?? []).map(item => item.key);
    expect(keys).toEqual(['tonight', 'history', 'profile']);
    expect(config.logo).toBeDefined();
    expect(config.user).toBeUndefined();
  });

  it('attaches a user block with uppercase initials but no logout item when onLogout is absent', () => {
    const config = createClientNavigation({ name: 'alice', id: 'u1' });

    expect(config.user).toBeDefined();
    expect(config.user?.name).toBe('alice');
    expect(config.user?.initials).toBe('A');
    expect(config.user?.menu).toEqual([]);
  });

  it('adds a logout menu item that invokes onLogout when both user and handler are given', () => {
    const onLogout = vi.fn();
    const config = createClientNavigation({ name: 'Bob', id: 'u2' }, onLogout);

    expect(config.user?.initials).toBe('B');
    const menu = config.user?.menu ?? [];
    expect(menu).toHaveLength(1);
    expect(menu[0]?.key).toBe('logout');
    expect(menu[0]?.path).toBe('/logout');

    menu[0]?.onSelect?.();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('does not attach a user block (so the logout item is unreachable) when onLogout is given without a user', () => {
    const onLogout = vi.fn();
    const config = createClientNavigation(undefined, onLogout);

    expect(config.user).toBeUndefined();
    expect(onLogout).not.toHaveBeenCalled();
  });
});

describe('createGuestNavigation', () => {
  it('exposes only a login item, a logo and no user block', () => {
    const config = createGuestNavigation();

    const items = config.sections[0]?.items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]?.key).toBe('login');
    expect(items[0]?.path).toBe('/login');
    expect(config.logo).toBeDefined();
    expect(config.user).toBeUndefined();
  });
});
