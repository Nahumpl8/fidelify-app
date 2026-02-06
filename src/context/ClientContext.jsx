import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ClientContext = createContext(null);

export const ClientProvider = ({ children }) => {
  const [clientProfile, setClientProfile] = useState(null);
  const [loyaltyCards, setLoyaltyCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientData = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch client profile by auth_user_id
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (clientError) throw clientError;
      setClientProfile(client);

      // Fetch all loyalty cards with business data
      const { data: cards, error: cardsError } = await supabase
        .from('loyalty_cards')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('client_id', client.id)
        .eq('state', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (cardsError) throw cardsError;
      setLoyaltyCards(cards || []);
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.role === 'client') {
        fetchClientData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.user_metadata?.role === 'client') {
        fetchClientData(session.user.id);
      } else {
        setClientProfile(null);
        setLoyaltyCards([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchClientData]);

  const refetch = useCallback(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchClientData(session.user.id);
    });
  }, [fetchClientData]);

  const value = {
    clientProfile,
    loyaltyCards,
    loading,
    error,
    refetch,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within ClientProvider');
  }
  return context;
};

export default ClientContext;
