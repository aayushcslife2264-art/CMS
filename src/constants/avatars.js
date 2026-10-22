// Official preset avatars strictly allowed in CMS (from Profile options)
export const ROLE_AVATARS = {
  user: [
    { label: "Avatar 1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 2", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 3", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 4", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 5", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 6", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
  ],
  admin: [
    { label: "Avatar 1", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 2", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 3", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 4", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 5", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 6", url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
  ],
  superadmin: [
    { label: "Avatar 1", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 3", url: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 4", url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 5", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
    { label: "Avatar 6", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&h=300&auto=format&fit=crop&crop=faces" },
  ],
};

// Deterministically pick one of the allowed profile avatars for a given role and seed
export const getDefaultAvatarForRole = (role = "user", seedStr = "") => {
  const normRole = (role || "user").toLowerCase();
  const list = ROLE_AVATARS[normRole] || ROLE_AVATARS.user;
  if (!seedStr) return list[0].url;

  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % list.length;
  return list[index].url;
};

// Sanitizes any avatar: if missing or DiceBear cartoon, replaces it with an allowed preset avatar
export const sanitizeAvatar = (avatarUrl, role = "user", seedStr = "") => {
  if (!avatarUrl || typeof avatarUrl !== "string" || avatarUrl.includes("dicebear") || avatarUrl.includes("api.dicebear")) {
    return getDefaultAvatarForRole(role, seedStr);
  }
  return avatarUrl;
};
