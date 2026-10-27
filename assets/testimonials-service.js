/**
 * Njamm Njamm - Testimonials Service & Persistence Layer
 * Handles loading, caching, syncing (LocalStorage + optional Supabase Cloud sync)
 */
(function(window) {
  const STORAGE_KEY = 'njamm_testimonials_v1';
  const CLOUD_CONFIG_KEY = 'njamm_testimonials_cloud_config';
  const PASSKEY_KEY = 'njamm_admin_passkey_hash';

  const defaultSeed = (window.DEFAULT_TESTIMONIALS && Array.isArray(window.DEFAULT_TESTIMONIALS))
    ? window.DEFAULT_TESTIMONIALS
    : [
        {
          id: "1",
          text: "Njamm Njamm products are so delicious. Banana chips are thin and crispy. The Sharkkaravaratty is sweet",
          author: "Yazin Azad",
          role: "Verified Customer",
          active: true,
          createdAt: new Date().toISOString()
        }
      ];

  const TestimonialsService = {
    // Get cloud configuration if provided
    getCloudConfig() {
      try {
        const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
        return raw ? JSON.parse(raw) : { enabled: false, supabaseUrl: '', supabaseKey: '', tableName: 'testimonials' };
      } catch (e) {
        return { enabled: false, supabaseUrl: '', supabaseKey: '', tableName: 'testimonials' };
      }
    },

    saveCloudConfig(config) {
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
    },

    // Check admin authentication
    isAdminAuthenticated() {
      return sessionStorage.getItem('njamm_admin_auth') === 'true' || localStorage.getItem('njamm_admin_remember') === 'true';
    },

    setAdminAuthenticated(status, remember = false) {
      if (status) {
        sessionStorage.setItem('njamm_admin_auth', 'true');
        if (remember) {
          localStorage.setItem('njamm_admin_remember', 'true');
        }
      } else {
        sessionStorage.removeItem('njamm_admin_auth');
        localStorage.removeItem('njamm_admin_remember');
      }
    },

    getPasskey() {
      return localStorage.getItem(PASSKEY_KEY) || 'njamm2026';
    },

    setPasskey(newPasskey) {
      localStorage.setItem(PASSKEY_KEY, newPasskey);
    },

    // Load testimonials from Cloud or Local
    async getAll() {
      const config = this.getCloudConfig();
      if (config.enabled && config.supabaseUrl && config.supabaseKey) {
        try {
          const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/${config.tableName || 'testimonials'}?select=*&order=created_at.asc`;
          const res = await fetch(endpoint, {
            headers: {
              'apikey': config.supabaseKey,
              'Authorization': `Bearer ${config.supabaseKey}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped = data.map(item => ({
                id: String(item.id),
                text: item.text || item.quote || '',
                author: item.author || item.name || '',
                role: item.role || 'Verified Customer',
                active: item.active !== undefined ? Boolean(item.active) : true,
                createdAt: item.created_at || item.createdAt || new Date().toISOString()
              }));
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
              return mapped;
            }
          }
        } catch (err) {
          console.warn('[Njamm Testimonials] Cloud fetch failed, falling back to local storage:', err);
        }
      }

      // Fallback to LocalStorage
      try {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('[Njamm Testimonials] Error parsing local storage:', e);
      }

      // Initialize with defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeed));
      return [...defaultSeed];
    },

    // Get only active testimonials for the public website
    async getActive() {
      const all = await this.getAll();
      const activeOnly = all.filter(item => item.active !== false);
      return activeOnly.length > 0 ? activeOnly : defaultSeed;
    },

    // Save testimonials to Local and Cloud
    async saveAll(testimonials) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
      
      // Dispatch custom events for live updates across page components and tabs
      window.dispatchEvent(new CustomEvent('njamm:testimonials-updated', { detail: testimonials }));
      try {
        localStorage.setItem('njamm_testimonials_ping', Date.now().toString());
      } catch (e) {}

      // If cloud is enabled, sync to cloud
      const config = this.getCloudConfig();
      if (config.enabled && config.supabaseUrl && config.supabaseKey) {
        try {
          // Cloud sync logic (Upsert)
          const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/${config.tableName || 'testimonials'}`;
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'apikey': config.supabaseKey,
              'Authorization': `Bearer ${config.supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(testimonials.map(t => ({
              id: t.id,
              text: t.text,
              author: t.author,
              role: t.role || '',
              active: t.active,
              created_at: t.createdAt || new Date().toISOString()
            })))
          });
        } catch (err) {
          console.warn('[Njamm Testimonials] Cloud sync error:', err);
        }
      }

      return testimonials;
    },

    async add(item) {
      const list = await this.getAll();
      const newItem = {
        id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        text: item.text.trim(),
        author: item.author.trim(),
        role: (item.role || 'Verified Customer').trim(),
        active: item.active !== false,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      await this.saveAll(list);
      return newItem;
    },

    async update(id, updatedFields) {
      const list = await this.getAll();
      const index = list.findIndex(t => String(t.id) === String(id));
      if (index === -1) throw new Error('Testimonial not found');
      
      list[index] = {
        ...list[index],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      await this.saveAll(list);
      return list[index];
    },

    async remove(id) {
      const list = await this.getAll();
      const filtered = list.filter(t => String(t.id) !== String(id));
      await this.saveAll(filtered);
      return filtered;
    },

    async resetToDefaults() {
      const freshSeed = JSON.parse(JSON.stringify(defaultSeed));
      await this.saveAll(freshSeed);
      return freshSeed;
    }
  };

  window.TestimonialsService = TestimonialsService;
})(window);
