import { useState, useEffect, useRef } from 'react';
import { PeerEngine } from './utils/peer-engine';
import { isSpam, RateLimiter } from './utils/spam-filter';
import { Send, Phone, Link as LinkIcon, Copy, Mic, CheckCheck, Volume2, MicOff, PhoneOff, X, Reply, Trash2, Video, VideoOff, Users, Lock, Plus, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import './index.css';

// Mock UI sounds
const sentSound = new Audio('/sent.mp3');
const receivedSound = new Audio('/received.mp3');

export const MalluLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))', display: 'inline-block' }}>
    <circle cx="50" cy="50" r="50" fill="url(#paint_logo)" />
    <path d="M25 42.5C25 32.835 32.835 25 42.5 25H57.5C67.165 25 75 32.835 75 42.5V57.5C75 67.165 67.165 75 57.5 75H40L25 85V65.8C25 65.8 25 65.8 25 42.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M37 42L49 54L61 42V60H65V35H61L50 47L39 35H35V60H39V42Z" fill="white" />
    <defs>
      <linearGradient id="paint_logo" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4ade80" />
        <stop offset="1" stopColor="#065f46" />
      </linearGradient>
    </defs>
  </svg>
);


export default function App() {
  const [viewMode, setViewMode] = useState<'private' | 'public'>('public');
  const [username, setUsername] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Video Call States
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Fake accurate-looking live users count starting at 400
  const [liveUsers, setLiveUsers] = useState<number>(400);

  // Private Chat States
  const [roomId, setRoomId] = useState<string>('');
  const [myId, setMyId] = useState<string>('');
  const [peerEngine] = useState(() => new PeerEngine());
  const [status, setStatus] = useState<string>('disconnected');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState<string>('');

  // Public Chat States
  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [publicInput, setPublicInput] = useState<string>('');

  // Reply State
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  // Admin States
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adText, setAdText] = useState('');
  const [adSponsor, setAdSponsor] = useState('Sponsor');

  // Incoming personal chat request
  const [incomingChatRequest, setIncomingChatRequest] = useState<{ conn: any, metadata: any } | null>(null);
  const [remoteUsername, setRemoteUsername] = useState<string>('User');

  // Advanced features
  const [remoteTyping, setRemoteTyping] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const typingTimeoutRef = useRef<any>(null);
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const usernameRef = useRef(username);
  usernameRef.current = username;
  const isCancelingVoiceRef = useRef<boolean>(false);

  // Call states
  const [inCall, setInCall] = useState<boolean>(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const publicMessagesEndRef = useRef<HTMLDivElement>(null);
  const rateLimiter = useRef(new RateLimiter(5, 5000));

  useEffect(() => {
    // Pulse Live Users Count
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(375, prev + Math.floor(Math.random() * 5) - 2));
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Setup Global Public Chat via ntfy WebSocket
    const ws = new WebSocket('wss://ntfy.sh/malluchat_v100/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'message') {
        try {
          const payload = JSON.parse(data.message);
          setPublicMessages(prev => {
            if (prev.find(m => m.id === payload.id)) return prev;
            return [...prev, payload];
          });
        } catch (e) { }
      }
    };

    // Setup PeerJS for Private Chat only if not initialized
    if (!peerEngine.peer) {
      peerEngine.initialize(
        (id) => setMyId(id),
        (err) => {
          console.error("PeerJS Error:", err);
          if (err?.type === 'peer-unavailable') {
            alert("Connection Failed: The user has gone offline or refreshed their page.");
            setViewMode('public');
            setStatus('disconnected');
          }
          // Removed server-error/network alerts which lock the user in a failed loop
        }
      );
    }

    peerEngine.onConnected = () => {
      setStatus('connected');
      setTimeout(() => {
        peerEngine.sendMessage({
          id: uuidv4(),
          senderId: peerEngine.id,
          senderName: usernameRef.current || 'User',
          type: 'user_info',
          timestamp: Date.now()
        } as any);
      }, 500);
    };

    peerEngine.onDisconnected = () => {
      setStatus('disconnected');
    };

    peerEngine.onConnectionRequest = (conn, metadata) => {
      // Automatically reject incoming generic connections if already chatting with someone else
      if (peerEngine.connection && peerEngine.connection.open && peerEngine.connection.peer !== conn.peer) {
        conn.close();
        return;
      }

      if (metadata?.type === 'decline') {
        alert(`${metadata.senderName} declined your chat request.`);
        setViewMode('public');
        setStatus('disconnected');
        return;
      }
      setIncomingChatRequest({ conn, metadata });
    };

    peerEngine.onMessage = (msg: any) => {
      if (msg.type === 'user_info') {
        if (msg.senderName) setRemoteUsername(msg.senderName);
        return;
      }
      if (msg.type === 'typing_start') {
        setRemoteTyping(true);
        return;
      }
      if (msg.type === 'typing_stop') {
        setRemoteTyping(false);
        return;
      }
      if (msg.type === 'reaction') {
        setMessages(prev => prev.map(m => m.id === msg.targetId ? { ...m, reaction: msg.reaction } : m));
        return;
      }
      if (msg.type === 'read') {
        setMessages(prev => prev.map(m => m.id === msg.targetId ? { ...m, status: 'read' } : m));
        return;
      }

      setRemoteTyping(false); // clear typing on msg receive
      setMessages(prev => [...prev, msg]);
      receivedSound.play().catch(() => { });

      // Send back read receipt automatically
      if (msg.type === 'text' || msg.type === 'voice') {
        peerEngine.sendMessage({
          id: uuidv4(),
          senderId: peerEngine.id,
          senderName: usernameRef.current,
          type: 'read',
          targetId: msg.id,
          timestamp: Date.now()
        });
      }
    };

    peerEngine.onCallReceived = (call) => {
      const callType = call.metadata?.callType;
      const isVideo = callType === 'private-video';

      if (window.confirm(`Incoming ${isVideo ? 'video' : 'voice'} call! Accept?`)) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo }).then((stream) => {
          call.answer(stream);
          call.on('stream', (rStream) => {
            setRemoteStream(rStream);
          });
          peerEngine.callConnection = call;
          peerEngine.localStream = stream;
          setInCall(true);
        }).catch(() => {
          alert("Permission denied. Could not start media devices.");
        });
      } else {
        call.close();
      }
    };

    peerEngine.onCallEnded = () => {
      setInCall(false);
      setRemoteStream(null);
      setIsMicMuted(false);
    };

    return () => {
      peerEngine.destroy();
      ws.close();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, remoteTyping]);

  useEffect(() => {
    publicMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [publicMessages]);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        if (!isAdminAuth) {
          setShowAdminLogin(true);
          setShowAdminPanel(false);
        } else {
          setShowAdminLogin(false);
          setShowAdminPanel(true);
        }
      } else {
        setShowAdminLogin(false);
        setShowAdminPanel(false);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdminAuth]);

  useEffect(() => {
    // Inject a fake AD message into the public chat exactly 10 seconds after joining
    const adTimer = setTimeout(() => {
      const adMsg = {
        id: uuidv4(),
        senderId: 'system-ad',
        senderName: 'Sponsor',
        type: 'ad',
        text: '<strong>Protect your privacy online with Surfshark VPN!</strong><br><a href="#" style="color: var(--primary); text-decoration: underline;">Get 80% off + 2 months free</a> anonymously with Crypto!',
        timestamp: Date.now()
      };
      setPublicMessages(prev => [...prev, adMsg]);
      setMessages(prev => [...prev, adMsg]);
    }, 10000);

    return () => clearTimeout(adTimer);
  }, []);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (peerEngine.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = peerEngine.localStream;
    }
  }, [remoteStream, inCall, viewMode]);

  const handleStartTyping = () => {
    if (status !== 'connected') return;
    peerEngine.sendMessage({ id: uuidv4(), senderId: myId, senderName: username, type: 'typing_start', timestamp: Date.now() } as any);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      peerEngine.sendMessage({ id: uuidv4(), senderId: myId, senderName: username, type: 'typing_stop', timestamp: Date.now() } as any);
    }, 2000);
  };

  const startRecording = async () => {
    try {
      if (!username) {
        setShowLoginModal(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isCancelingVoiceRef.current = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        setRecordingTime(0);

        if (isCancelingVoiceRef.current) return;
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const msg = {
            id: uuidv4(),
            senderId: myId,
            senderName: username,
            type: 'voice',
            voiceBlob: base64Audio,
            timestamp: Date.now(),
            status: 'delivered'
          } as any;

          if (viewModeRef.current === 'public') {
            // Public chat voice messages cannot fit in ntfy's 4KB payload limit as base64.
            // Uploading to an anonymous temporary file host.
            const form = new FormData();
            form.append('file', audioBlob, 'voice.webm');
            fetch('https://tmpfiles.org/api/v1/upload', {
              method: 'POST',
              body: form
            })
              .then(res => res.json())
              .then(data => {
                const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                const publicMsg = { ...msg, voiceBlob: directUrl };
                setPublicMessages(prev => [...prev, publicMsg]);
                fetch('https://ntfy.sh/malluchat_v100', {
                  method: 'POST',
                  body: JSON.stringify(publicMsg)
                }).catch(() => { });
                sentSound.play().catch(() => { });
              }).catch(() => {
                alert("Failed to upload public voice message.");
              });
          } else {
            // Private direct connection can handle large data naturally
            peerEngine.sendMessage(msg);
            setMessages(prev => [...prev, msg]);
            sentSound.play().catch(() => { });
          }
        };
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (e) {
      alert('Microphone access is required for voice messages.');
    }
  };

  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancelingVoiceRef.current = true;
      mediaRecorderRef.current.stop();
    }
  };

  const CustomAudioPlayer = ({ src, isMine }: { src: string, isMine: boolean }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleEnded);
      };
    }, []);

    const togglePlay = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    return (
      <div className="audio-player-wrapper" style={{ background: isMine ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '20px' }}>
        <audio ref={audioRef} src={src} className="hidden-audio" />
        <button className="play-btn" onClick={togglePlay} style={{ background: isMine ? 'var(--primary)' : 'var(--text-main)', color: '#000', width: '36px', height: '36px', minWidth: '36px' }}>
          <div style={{ marginLeft: isPlaying ? '0' : '2px', display: 'flex' }}>
            {isPlaying ? (
              <div style={{ width: '10px', height: '10px', background: '#000', borderRadius: '1px' }}></div>
            ) : (
              <div style={{ width: '0', height: '0', borderStyle: 'solid', borderWidth: '6px 0 6px 10px', borderColor: 'transparent transparent transparent #000' }}></div>
            )}
          </div>
        </button>
        <div className="audio-progress">
          <div className="audio-progress-bar" style={{ width: `${progress}%`, background: isMine ? 'var(--primary)' : 'var(--text-main)' }}></div>
        </div>
      </div>
    );
  };

  const goPrivate = (isHost: boolean) => {
    if (!username) return alert("Please enter a username first");
    setViewMode('private');
    if (!isHost) {
      if (!roomId) return alert("Enter Room ID to join");
      peerEngine.connectToPeer(roomId.toUpperCase(), { senderName: username, type: 'room-join' });
      setStatus('connecting');
    }
  };

  const requestPrivateChat = (remoteId: string, remoteName: string) => {
    if (!username) return alert("Please enter a username first");
    if (!remoteId) return alert("This user has an invalid connection ID.");
    if (remoteId === myId) return alert("You cannot private chat with yourself!");

    peerEngine.connectToPeer(remoteId, { senderName: username, type: 'public-invite' });
    setRemoteUsername(remoteName);
    setViewMode('private');
    setStatus('connecting');
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (isSpam(inputText)) {
      alert("Anti-Spam active: Links or phone numbers are not allowed.");
      setInputText('');
      return;
    }

    if (!rateLimiter.current.checkLimit()) {
      alert("Slow down! You are sending messages too fast.");
      return;
    }

    const msg = {
      id: uuidv4(),
      senderId: myId,
      senderName: username,
      type: 'text',
      text: inputText,
      timestamp: Date.now(),
      status: 'delivered',
      replyToId: replyingTo?.id,
      replyText: replyingTo?.text || "Voice/Image"
    } as any;

    peerEngine.sendMessage(msg);
    setMessages(prev => [...prev, msg]);
    setInputText('');
    setReplyingTo(null);
    peerEngine.sendMessage({ id: uuidv4(), senderId: myId, senderName: username, type: 'typing_stop', timestamp: Date.now() } as any);
    sentSound.play().catch(() => { });
  };

  const handleSendPublic = () => {
    if (!publicInput.trim()) return;
    if (isSpam(publicInput)) return alert("Spam blocked.");
    if (!rateLimiter.current.checkLimit()) return alert("Slow down.");

    const msg = {
      id: uuidv4(),
      senderId: myId,
      senderName: username,
      type: 'text',
      text: publicInput,
      timestamp: Date.now(),
      replyToId: replyingTo?.id,
      replyText: replyingTo?.text || "Voice/Image"
    };

    setPublicMessages(prev => [...prev, msg]);
    fetch('https://ntfy.sh/malluchat_v100', {
      method: 'POST',
      body: JSON.stringify(msg)
    }).catch(() => { });

    setPublicInput('');
    setReplyingTo(null);
  };

  const handleSendAd = () => {
    if (!adText.trim()) return alert('Ad text is required');

    // allow sending images via base64 or URL
    let adContent = adText;
    if (adLinkUrl) {
      adContent = `<a href="${adLinkUrl}" target="_blank" style="color: var(--primary); text-decoration: underline;">${adText}</a>`;
    }

    const adMsg = {
      id: uuidv4(),
      senderId: 'system-ad',
      senderName: adSponsor || 'Sponsor',
      type: 'ad',
      text: adContent,
      adImageUrl: adImageUrl || undefined,
      timestamp: Date.now()
    } as any;

    setPublicMessages(prev => [...prev, adMsg]);
    fetch('https://ntfy.sh/malluchat_v100', {
      method: 'POST',
      body: JSON.stringify(adMsg)
    }).catch(() => { });

    alert('Ad Broadcasted successfully!');
    window.location.hash = '';
    setAdText('');
    setAdImageUrl('');
    setAdLinkUrl('');
    setAdSponsor('Sponsor');
  };

  const handleAdminLogin = () => {
    // Basic verification logic
    if (adminEmail === 'admin@malluchat.online' && adminPassword === 'Admin@123') {
      setIsAdminAuth(true);
      setShowAdminLogin(false);
      setShowAdminPanel(true);
    } else {
      alert("Invalid admin credentials");
    }
  };

  const handleReaction = (msgId: string) => {
    const reactionMsg = { id: uuidv4(), senderId: myId, senderName: username, type: 'reaction', targetId: msgId, reaction: '❤️', timestamp: Date.now() } as any;
    peerEngine.sendMessage(reactionMsg);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction: '❤️' } : m));
  };

  const initiateCall = async (isVideo: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      // we use the actual connected peer id
      const remoteId = peerEngine.connection?.peer;
      if (!remoteId) return alert('No active peer connected');

      const call = await peerEngine.startCall(remoteId, stream, { metadata: { callType: isVideo ? 'private-video' : 'private-voice' } });

      if (call) {
        call.on('stream', (rStream) => {
          setRemoteStream(rStream);
        });
        setInCall(true);
      }
    } catch (err) {
      alert("Microphone permission required for calls.");
    }
  };

  const toggleMute = () => {
    if (peerEngine.localStream) {
      const track = peerEngine.localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMicMuted(!track.enabled);
      }
    }
  };


  const toggleCamera = () => {
    if (peerEngine.localStream) {
      const vTrack = peerEngine.localStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setIsCameraOff(!vTrack.enabled);
      }
    }
  };

  const toggleLoudspeaker = () => {
    alert("Loudspeaker mode activated!");
    // Note: setSinkId is not widely supported yet without specialized permissions.
  };

  const scrollToMessage = (msgId: string) => {
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const bubble = element.querySelector('.message-bubble');
      if (bubble) {
        bubble.classList.remove('highlighted');
        // Trigger reflow to restart animation
        void (bubble as HTMLElement).offsetWidth;
        bubble.classList.add('highlighted');
      }
    }
  };


  // ======== RENDERS ======== 
  return (
    <div className="app-layout">
      {/* Left Sidebar (Desktop/Tablet) */}
      <div className="sidebar-left glass">
        <div className="sidebar-header">
          <MalluLogo size={36} />
          <h2>MalluChat</h2>
        </div>

        <nav className="desktop-nav">
          <div className={`nav-item-desktop ${viewMode === 'public' ? 'active' : ''}`} onClick={() => setViewMode('public')}>
            <Users size={20} />
            World Chat
          </div>
          <div className={`nav-item-desktop ${viewMode === 'private' ? 'active' : ''}`} onClick={() => {
            if (!username && viewMode === 'public') {
              setShowLoginModal(true);
              return;
            }
            setViewMode('private');
          }}>
            <Lock size={20} />
            Private Space
          </div>
          <a className="nav-item-desktop" href="/malluchat.apk" download="malluchat.apk" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '10px', paddingTop: '15px' }}>
            <Download size={20} />
            Get Android App
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="header-status" style={{ padding: '0 1rem' }}>
            <span className="status-dot"></span>
            {viewMode === 'public'
              ? `${liveUsers} Online right now`
              : (status === 'connected' ? 'Secure Connect' : 'Waiting...')}
          </div>
        </div>
      </div>

      <div className="chat-main-container">

        {/* Login Modal */}
        {showLoginModal && (
          <div className="call-overlay" style={{ zIndex: 2000 }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', maxWidth: '350px', width: '90%', textAlign: 'center', position: 'relative' }}>
              <button
                className="icon-btn"
                style={{ position: 'absolute', top: '15px', right: '15px' }}
                onClick={() => setShowLoginModal(false)}
              >
                <X size={20} />
              </button>
              <h2 style={{ marginBottom: '1rem' }}>Join the Chat</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Choose a display name to start chatting anonymously.</p>
              <input
                className="input-field"
                placeholder="Enter display name..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={20}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && username.trim()) setShowLoginModal(false);
                }}
              />
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
                disabled={!username.trim()}
                onClick={() => setShowLoginModal(false)}
              >
                Start Chatting
              </button>
              <p style={{ marginTop: '1.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                By continuing, you agree to our <br /><a href="terms" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms & Conditions</a> and <a href="privacy" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</a>.
              </p>
            </div>
          </div>
        )}

        {/* Admin Login Modal */}
        {showAdminLogin && !isAdminAuth && (
          <div className="call-overlay" style={{ zIndex: 3000 }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', maxWidth: '350px', width: '90%', textAlign: 'center', position: 'relative' }}>
              <button
                className="icon-btn"
                style={{ position: 'absolute', top: '15px', right: '15px' }}
                onClick={() => { window.location.hash = ''; setShowAdminLogin(false) }}
              >
                <X size={20} />
              </button>
              <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Admin Login</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter credentials to access the broadcast panel.</p>
              <input
                className="input-field"
                type="email"
                placeholder="Admin Email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <input
                className="input-field"
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdminLogin();
                }}
              />
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={handleAdminLogin}
              >
                Secure Login
              </button>
            </div>
          </div>
        )}

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <div className="call-overlay" style={{ zIndex: 3000 }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'left', position: 'relative' }}>
              <button
                className="icon-btn"
                style={{ position: 'absolute', top: '15px', right: '15px' }}
                onClick={() => { window.location.hash = ''; setShowAdminPanel(false) }}
              >
                <X size={20} />
              </button>
              <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Admin Control Panel</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Send a sponsored broadcast ad directly into the chat stream.</p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sponsor Name</label>
                <input className="input-field" value={adSponsor} onChange={e => setAdSponsor(e.target.value)} placeholder="e.g. System, Admin, Surfshark" />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ad Text (HTML supported)</label>
                <textarea className="input-field" value={adText} onChange={e => setAdText(e.target.value)} placeholder="Wait! Secure your internet connection..." style={{ minHeight: '80px', resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hyperlink URL</label>
                <input className="input-field" value={adLinkUrl} onChange={e => setAdLinkUrl(e.target.value)} placeholder="https://..." />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Image URL (Optional)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input className="input-field" value={adImageUrl} onChange={e => setAdImageUrl(e.target.value)} placeholder="https://..." />
                  <label className="icon-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '0 10px', background: 'rgba(255,255,255,0.1)' }}>
                    Upload
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAdImageUrl('Uploading...');
                        const form = new FormData();
                        form.append('file', file);
                        fetch('https://tmpfiles.org/api/v1/upload', {
                          method: 'POST',
                          body: form
                        })
                          .then(res => res.json())
                          .then(data => {
                            const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                            setAdImageUrl(directUrl);
                          })
                          .catch(() => {
                            alert('Failed to upload ad image.');
                            setAdImageUrl('');
                          });
                      }
                    }} />
                  </label>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSendAd}>
                Broadcast Ad to General Chat
              </button>
            </div>
          </div>
        )}

        {/* Incoming Chat Request Notification */}
        {incomingChatRequest && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--panel-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '350px',
            width: 'calc(100% - 40px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease-out forwards'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Chat Request</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <strong>{incomingChatRequest.metadata?.senderName || 'Someone'}</strong> wants to connect securely.
                </p>
              </div>
              <div style={{ padding: '6px', background: 'rgba(74, 222, 128, 0.1)', color: 'var(--primary)', borderRadius: '50%' }}>
                <LinkIcon size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary" style={{ flex: 1, margin: 0, padding: '0.6rem', fontSize: '0.9rem' }}
                onClick={() => {
                  incomingChatRequest.conn.close();
                  peerEngine.sendDeclineRequest(incomingChatRequest.conn.peer, { type: 'decline', senderName: username });
                  setIncomingChatRequest(null);
                }}
              >
                Decline
              </button>
              <button
                className="btn btn-primary" style={{ flex: 1, margin: 0, padding: '0.6rem', fontSize: '0.9rem' }}
                onClick={() => {
                  peerEngine.setupConnection(incomingChatRequest.conn);
                  setRemoteUsername(incomingChatRequest.metadata?.senderName || 'User');
                  setViewMode('private');
                  setStatus('connected');
                  setIncomingChatRequest(null);
                }}
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {/* Call Overlay Interface */}
        {inCall && (
          <div className="call-overlay" style={{ background: '#000', padding: 0 }}>
            {peerEngine.localStream?.getVideoTracks().length || remoteStream?.getVideoTracks().length ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <video ref={localVideoRef} autoPlay playsInline muted style={{ position: 'absolute', top: '20px', right: '20px', width: '100px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '2px solid white', display: isCameraOff ? 'none' : 'block', transform: 'scaleX(-1)' }} />

                <div className="call-controls" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                  <button className={`call-ctrl-btn ${isMicMuted ? 'active' : ''}`} onClick={toggleMute} title="Mute Mic">
                    {isMicMuted ? <MicOff size={28} /> : <Mic size={28} />}
                  </button>
                  <button className="call-ctrl-btn" style={{ background: isCameraOff ? 'var(--danger)' : 'rgba(255,255,255,0.2)' }} onClick={toggleCamera} title="Toggle Camera">
                    {isCameraOff ? <VideoOff size={28} /> : <Video size={28} />}
                  </button>
                  <button className="call-ctrl-btn end" onClick={() => peerEngine.endCall()} title="End Call">
                    <PhoneOff size={28} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="call-avatar-large">
                  <MalluLogo size={80} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Secure Voice Call</h2>
                <p style={{ color: 'var(--text-muted)' }}>Secure Channel Active</p>

                <div className="call-controls">
                  <button className={`call-ctrl-btn ${isMicMuted ? 'active' : ''}`} onClick={toggleMute} title="Mute Mic">
                    <MicOff size={28} />
                  </button>
                  <button className="call-ctrl-btn end" onClick={() => peerEngine.endCall()} title="End Call">
                    <PhoneOff size={28} />
                  </button>
                  <button className="call-ctrl-btn" onClick={toggleLoudspeaker} title="Loudspeaker">
                    <Volume2 size={28} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="chat-screen">
          {/* Header */}
          <div className="chat-header">
            <div className="header-user-info">
              <div className="avatar">
                <MalluLogo size={32} />
              </div>
              <div style={{ marginLeft: '6px' }}>
                <div style={{ fontWeight: 600 }}>{viewMode === 'public' ? 'Mallu Public Chat' : remoteUsername}</div>
                <div className="header-status">
                  <span className="status-dot"></span>
                  {viewMode === 'public'
                    ? `${liveUsers} Online right now`
                    : (status === 'connected' ? 'Secure Connect' : 'Waiting for User...')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {viewMode === 'private' && status === 'connected' && (
                <>
                  <button className={`icon-btn ${inCall ? 'active' : ''}`} onClick={() => initiateCall(true)} title="Secure Video Call">
                    <Video size={20} />
                  </button>
                  <button className={`icon-btn ${inCall ? 'active' : ''}`} onClick={() => initiateCall(false)} title="Secure Voice Call">
                    <Phone size={20} />
                  </button>
                </>
              )}
              {viewMode === 'private' && (
                <button className="icon-btn" onClick={() => { setViewMode('public'); peerEngine.endCall(); }} title="Leave">
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Waiting Room State (Private only) */}
          {viewMode === 'private' && status !== 'connected' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', textAlign: 'center', maxWidth: '300px' }}>
                <LinkIcon size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '1rem' }}>{status === 'connecting' ? `Connecting to ${remoteUsername}...` : 'Your Room is Ready'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {status === 'connecting' ? 'Waiting for them to accept your request...' : 'Send this exact code to your friend to securely connect.'}
                </p>
                {status !== 'connecting' && (
                  <div className="share-container">
                    <div className="share-link" style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>{myId || '...'}</div>
                    <button className="copy-btn" onClick={() => navigator.clipboard.writeText(myId)} style={{ marginTop: '0.5rem' }}>
                      <Copy size={14} style={{ display: 'inline', marginRight: '4px' }} /> Copy Code
                    </button>
                  </div>
                )}

                {status !== 'connecting' && (
                  <div style={{ marginTop: '2rem', width: '100%' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Or Join a Friend</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="input-field"
                        placeholder="Code (e.g. A48FXY)"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value.toUpperCase())}
                        style={{ padding: '0.6rem', flex: 1 }}
                        maxLength={6}
                      />
                      <button className="btn btn-primary" style={{ padding: '0.6rem 1rem', width: 'auto', margin: 0 }} onClick={() => {
                        if (!username) { setShowLoginModal(true); return; }
                        if (!roomId) { alert("Enter code"); return; }
                        goPrivate(false);
                      }}>
                        Join
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {(viewMode === 'public' || status === 'connected') && (
            <div className="chat-messages" style={{ paddingBottom: '10px' }}>
              <div className="system-message">
                {viewMode === 'public'
                  ? 'Welcome to Mallu Public Chat. Anyone can see messages here.'
                  : 'Secure Connection Established. Messages are direct and not stored anywhere.'}
              </div>

              {(viewMode === 'private' ? messages : publicMessages).map((msg, idx) => {
                if (msg.type === 'system') {
                  return <div key={idx} className="system-message">{msg.text}</div>;
                }

                const isMine = msg.senderId === myId;
                return (
                  <motion.div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`message-wrapper ${isMine ? 'msg-sent' : 'msg-received'}`}
                    onDoubleClick={() => viewMode === 'private' && !isMine && handleReaction(msg.id)}
                    style={{ cursor: (!isMine && viewMode === 'private') ? 'pointer' : 'default' }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 50) {
                        setReplyingTo(msg);
                      }
                    }}
                  >
                    <div className="message-bubble">
                      {msg.replyToId && (
                        <div className="reply-context" onClick={() => scrollToMessage(msg.replyToId!)} style={{ cursor: 'pointer' }}>
                          <Reply size={12} style={{ marginRight: '4px', display: 'inline' }} />
                          <i>{msg.replyText}</i>
                        </div>
                      )}

                      {msg.type === 'text' && msg.text}
                      {msg.type === 'voice' && (
                        <CustomAudioPlayer src={msg.voiceBlob} isMine={isMine} />
                      )}
                      {msg.type === 'ad' && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsored</span>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Ad</span>
                          </div>
                          {msg.adImageUrl && (
                            <img src={msg.adImageUrl} alt="Sponsored" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px', objectFit: 'cover' }} />
                          )}
                          <div dangerouslySetInnerHTML={{ __html: msg.text || '' }} style={{ fontSize: '0.95rem' }} />
                        </div>
                      )}

                      {msg.reaction && (
                        <div style={{ position: 'absolute', bottom: '-10px', right: isMine ? 'auto' : '-10px', left: isMine ? '-10px' : 'auto', background: 'var(--panel-bg)', borderRadius: '50%', padding: '2px', fontSize: '12px', border: '1px solid var(--panel-border)' }}>
                          {msg.reaction}
                        </div>
                      )}
                    </div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {!isMine && msg.type !== 'ad' && (
                        <span
                          style={{ marginLeft: '4px', opacity: 0.6, cursor: viewMode === 'public' ? 'pointer' : 'default', textDecoration: viewMode === 'public' ? 'underline' : 'none' }}
                          onClick={() => {
                            if (viewMode === 'public') {
                              requestPrivateChat(msg.senderId, msg.senderName);
                            }
                          }}
                        >
                          • {msg.senderName}
                          {viewMode === 'public' && <span style={{ fontSize: '0.6rem', marginLeft: '2px', color: 'var(--primary)', fontWeight: 'bold' }}>(Private Chat)</span>}
                        </span>
                      )}
                      {isMine && viewMode === 'private' && (
                        <span className={`msg-status ${msg.status === 'read' ? 'msg-read' : ''}`}>
                          {msg.status === 'read' ? <CheckCheck size={14} /> : <CheckCheck size={14} opacity={0.5} />}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {remoteTyping && viewMode === 'private' && (
                <div className="message-wrapper msg-received" style={{ opacity: 0.7 }}>
                  <div className="message-bubble" style={{ padding: '0.4rem 1rem', display: 'flex', gap: '4px' }}>
                    <span className="status-dot"></span>
                    <span className="status-dot" style={{ animationDelay: '0.2s' }}></span>
                    <span className="status-dot" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}

              <div ref={viewMode === 'public' ? publicMessagesEndRef : messagesEndRef} />
            </div>
          )}

          {/* Chat Input */}
          {(viewMode === 'public' || status === 'connected') && (
            <div className="chat-input-area" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {replyingTo && (
                <div className="reply-context" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span>Replying to: <i>{replyingTo.text || 'Voice Message'}</i></span>
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => setReplyingTo(null)} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {isRecording ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                    <button className="icon-btn" onClick={cancelRecording} title="Cancel Recording" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', padding: '10px', borderRadius: '50%' }}>
                      <Trash2 size={20} />
                    </button>
                    <span className="pulse-green" style={{ background: 'var(--danger)' }}></span>
                    <span style={{ flex: 1 }}>
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tap Send to stop</span>
                  </div>
                ) : (
                  <>
                    <button className="icon-btn" style={{ padding: '8px' }} onClick={() => alert('Attachments coming soon!')}>
                      <Plus size={22} />
                    </button>
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={viewMode === 'public' ? "Send to public..." : "Type a secure message..."}
                      value={viewMode === 'public' ? publicInput : inputText}
                      onFocus={() => {
                        if (viewMode === 'public' && !username) {
                          setShowLoginModal(true);
                        }
                      }}
                      onChange={e => {
                        if (viewMode === 'public') {
                          setPublicInput(e.target.value);
                        } else {
                          setInputText(e.target.value);
                          handleStartTyping();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (!username && viewMode === 'public') {
                            setShowLoginModal(true);
                          } else {
                            if (viewMode === 'public') { handleSendPublic(); } else { handleSend(); }
                          }
                        }
                      }}
                    />
                  </>
                )}

                {(viewMode === 'public' ? publicInput : inputText) ? (
                  <button
                    className="send-btn"
                    onClick={() => {
                      if (!username) { setShowLoginModal(true); return; }
                      if (viewMode === 'public') { handleSendPublic(); } else { handleSend(); }
                    }}
                  >
                    <Send size={20} />
                  </button>
                ) : (
                  <button
                    className="send-btn"
                    onClick={isRecording ? stopRecordingAndSend : startRecording}
                    style={isRecording ? { background: 'var(--primary)', color: '#000' } : { background: 'var(--panel-bg)', color: 'var(--text-main)', border: '1px solid var(--panel-border)' }}
                    title={isRecording ? "Send Voice Message" : "Record Voice Message"}
                  >
                    {isRecording ? <Send size={20} /> : <Mic size={20} />}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="bottom-bar-nav">
            <div className={`nav-item ${viewMode === 'public' ? 'active' : ''}`} onClick={() => setViewMode('public')}>
              <Users size={24} />
              World
            </div>
            <a className="nav-item" href="/malluchat.apk" download="malluchat.apk" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              <Download size={24} />
              App
            </a>
            <div className={`nav-item ${viewMode === 'private' ? 'active' : ''}`} onClick={() => {
              if (!username && viewMode === 'public') {
                setShowLoginModal(true);
                return;
              }
              setViewMode('private');
            }}>
              <Lock size={24} />
              Private Space
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Desktop only) */}
      <div className="sidebar-right glass">
        <div className="sidebar-header">
          <h2 style={{ fontSize: '1.1rem' }}>Room Info</h2>
        </div>
        <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>
          <p>You are currently in <strong>{viewMode === 'public' ? 'World Chat' : 'Private Space'}</strong>.</p>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsored</h4>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
              <strong>Protect your privacy online with Surfshark VPN!</strong><br />
              <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Get 80% off + 2 months free</a> anonymously with Crypto!
            </div>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
            <a href="terms" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Terms & Conditions</a>
            <a href="privacy" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Privacy Policy</a>
            <a href="aup" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Acceptable Use Policy</a>
            <a href="disclaimer" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Disclaimer</a>
          </div>
        </div>
      </div>

      <audio ref={remoteAudioRef} autoPlay className="hidden-audio" />
    </div>
  );
}
