const SESSION_PREFIX = 'horizonte-espanhol-game-session-v1';

export function loadGameSession<T>(level: number, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const saved = window.localStorage.getItem(`${SESSION_PREFIX}-${level}`);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveGameSession<T>(level: number, session: T) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`${SESSION_PREFIX}-${level}`, JSON.stringify(session));
  }
}

export function clearGameSession(level: number) {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(`${SESSION_PREFIX}-${level}`);
  }
}
