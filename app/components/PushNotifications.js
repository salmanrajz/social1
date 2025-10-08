'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function PushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if user is already subscribed
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    const permission = await Notification.requestPermission();
    setPermission(permission);
    
    if (permission === 'granted') {
      await subscribeToPush();
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported || !session) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userId: session.user.id,
        }),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session?.user?.id,
          }),
        });
        
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  if (!isSupported || !session) {
    return null;
  }

  return (
    <div className="push-notifications">
      <div className="push-notifications-header">
        <h3>🔔 Push Notifications</h3>
        <p>Get notified about new viral content and trending products</p>
      </div>
      
      <div className="push-notifications-status">
        {permission === 'granted' ? (
          <div className="push-status granted">
            <span className="push-status-icon">✅</span>
            <span>Notifications enabled</span>
          </div>
        ) : permission === 'denied' ? (
          <div className="push-status denied">
            <span className="push-status-icon">❌</span>
            <span>Notifications blocked</span>
          </div>
        ) : (
          <div className="push-status default">
            <span className="push-status-icon">⚠️</span>
            <span>Notifications not configured</span>
          </div>
        )}
      </div>

      <div className="push-notifications-actions">
        {permission === 'granted' ? (
          <button
            onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
            className={`push-button ${isSubscribed ? 'push-button--unsubscribe' : 'push-button--subscribe'}`}
          >
            {isSubscribed ? '🔕 Disable Notifications' : '🔔 Enable Notifications'}
          </button>
        ) : (
          <button
            onClick={requestPermission}
            className="push-button push-button--request"
          >
            🔔 Enable Notifications
          </button>
        )}
      </div>
    </div>
  );
}
