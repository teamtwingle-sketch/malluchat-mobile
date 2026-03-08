import React from 'react';
import { MalluLogo } from './MalluLogo';

const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    color: 'var(--text-main)',
    lineHeight: '1.6',
    fontFamily: 'var(--font-family, sans-serif)',
};

const Header = ({ title }: { title: string }) => (
    <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '0.2rem', fontSize: '1.8rem' }}>{title}</h1>
            <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                ← Back to Home
            </a>
        </div>
        <a href="/" style={{
            background: 'var(--primary)',
            color: '#000',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem'
        }}>
            Open MalluChat Website →
        </a>
    </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{title}</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{children}</div>
    </div>
);

export const PrivacyPage = () => (
    <div style={containerStyle} className="glass">
        <Header title="Privacy Policy" />

        {/* Website Opening Section */}
        <div style={{
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(6, 95, 70, 0.2) 100%)',
            padding: '2rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            textAlign: 'center',
            border: '1px solid rgba(74, 222, 128, 0.2)'
        }}>
            <div style={{ marginBottom: '1rem' }}><MalluLogo size={60} /></div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Experience MalluChat Online</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Join the fastest growing anonymous chat platform. No registration, no logs, just pure communication.</p>
            <a href="/" style={{
                background: 'var(--primary)',
                color: '#000',
                padding: '0.8rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block'
            }}>Join the Chat Now</a>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}><em>Effective Date: February 2026</em></p>

        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>MalluChat.online operates a privacy-first, peer-to-peer communication model. This policy outlines our technical architecture and strict adherence to data minimization principles.</p>

        <Section title="1. No Personal Data Collection">
            <p>Our platform strictly operates without user accounts. We DO NOT collect, request, or store:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Email addresses, phone numbers, or real names.</li>
                <li>Account registration data or passwords.</li>
                <li>Chat histories or logs of whom you connected with.</li>
            </ul>
        </Section>

        <Section title="2. Peer-to-Peer Architecture (Private Rooms)">
            <p>Private communications on MalluChat utilize WebRTC technology. This establishes a direct, peer-to-peer (P2P) connection between users. We act as a neutral signaling bridge to initiate the connection. We do not intercept, monitor, or store any text chat messages, audio data, or video streams transmitted through these direct links.</p>
        </Section>

        <Section title="3. Ephemeral Public Chat">
            <p>Messages broadcasted into the "World Chat" are transmitted in real-time. We maintain no permanent centralized database of these chat logs. Public chat data is transient and ceases to exist on our immediate systems once the active session terminates.</p>
        </Section>

        <Section title="4. Essential Technical Data">
            <p>To facilitate connections, we and our trusted third-party infrastructure temporarily process essential routing data (such as IP addresses and ephemeral session tokens). This metadata is required strictly for service functionality, is highly volatile, and is not permanently logged by us.</p>
        </Section>

        <Section title="5. Security & Data Protection">
            <p>We do not sell, rent, or trade user data. While we implement standard web encryption protocols, users must acknowledge that no internet transmission is entirely impervious to security breaches. We retain zero session-based data once a browser instance is closed.</p>
        </Section>

        <Section title="6. Age Restriction">
            <p>The platform is strictly restricted to users aged 18 and older. We do not knowingly permit access to minors or collect data concerning children.</p>
        </Section>
    </div>
);

export const TermsPage = () => (
    <div style={containerStyle} className="glass">
        <Header title="Terms and Conditions" />

        {/* Website Opening Section */}
        <div style={{
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(6, 95, 70, 0.2) 100%)',
            padding: '2.5rem 2rem',
            borderRadius: '24px',
            marginBottom: '3rem',
            textAlign: 'center',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
            <div style={{ marginBottom: '1.5rem' }}><MalluLogo size={80} /></div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.8rem', fontSize: '2.2rem', fontWeight: '800' }}>Welcome to MalluChat</h2>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>The safest place for private Malayalee conversations. Click below to enter the platform directly.</p>
            <a href="/" style={{
                background: 'var(--primary)',
                color: '#000',
                padding: '1rem 3rem',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: '900',
                display: 'inline-block',
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 4px 20px rgba(74, 222, 128, 0.4)'
            }}>Enter Chat Room →</a>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}><em>Effective Date: February 2026</em></p>

        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>By accessing MalluChat.online, you expressly agree to these Terms and Conditions.</p>

        <Section title="1. Legal Classification & Intermediary Status">
            <p>MalluChat is strictly classified as an <strong>&quot;Intermediary&quot;</strong> under Section 2(w) of the Information Technology Act, 2000 (India). We claim comprehensive Safe Harbour protection under Section 79 of the IT Act. We provide a neutral technological framework allowing users to transmit information.</p>
            <p style={{ marginTop: '0.5rem' }}>Specifically, MalluChat DOES NOT:<br />
                (a) Initiate the transmission of communications.<br />
                (b) Select the receiver of the transmission.<br />
                (c) Select or modify the information contained in the transmission.<br />
                Neither do we exercise editorial control or actively monitor private peer-to-peer communications.
            </p>
        </Section>

        <Section title="2. User Responsibility & Age Restriction">
            <p>You must be exactly 18 years of age or older to access this platform. You are solely and entirely responsible for any content you transmit, share, or generate.</p>
        </Section>

        <Section title="3. Limitation of Liability">
            <p style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>To the maximum extent permitted by applicable law, under no circumstances shall MalluChat, its founders, operators, developers, or affiliates be held liable for any direct, indirect, incidental, punitive, special, or consequential damages resulting from (i) your access to or inability to access the platform; (ii) any conduct or content generated by any third party; (iii) any unauthorized access, use, or alteration of transmissions; or (iv) any misuse of the peer-to-peer private rooms.</p>
        </Section>

        <Section title="4. Indemnification">
            <p>You agree to indemnify, defend, and hold harmless MalluChat and its operators from any claims, liabilities, damages, and expenses (including legal fees) arising from your use of the platform, your violation of these terms, or your infringement of any third-party rights.</p>
        </Section>

        <Section title="5. Enforcement & Government Cooperation">
            <p>We reserve the absolute right to suspend, block, or permanently restrict access to any user without prior notice at our sole discretion. We fully cooperate with lawful, binding government and court orders relating to cyber activity investigations under Indian law.</p>
        </Section>

        <Section title="6. Governing Law & Jurisdiction">
            <p>These terms are governed exclusively by the laws of the Republic of India. Any disputes arising out of these terms or platform usage shall be subject to the exclusive jurisdiction of the competent courts located in India.</p>
        </Section>

        <Section title="7. Force Majeure & Disclaimer of Warranty">
            <p>The platform is provided &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot;. We offer no warranties that the service will be uninterrupted, secure, or error-free. We shall not be liable for any service interruptions caused by acts of God, infrastructure failures, or external events beyond our control. We disclaim all responsibility for any misuse of the peer-to-peer private rooms.</p>
        </Section>
    </div>
);

export const AUPPage = () => (
    <div style={containerStyle} className="glass">
        <Header title="Acceptable Use Policy" />
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}><em>Effective Date: February 2026</em></p>

        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>To ensure compliance with the Information Technology Act, 2000, and standard global regulations, use of the platform for the following activities is strictly prohibited.</p>

        <Section title="Strictly Prohibited Material & Conduct">
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <li><strong>Child Sexual Abuse Material (CSAM):</strong> Depicting or linking to the exploitation of minors is a severe criminal offense resulting in immediate reporting to authorities.</li>
                <li><strong>Terrorism & Violence:</strong> Promoting terror activities, inciting violence, or instructing others in the creation of weapons.</li>
                <li><strong>Obscene & Explicit Content:</strong> Transmitting non-consensual sexual content, explicit pornography, or deeply offensive/defamatory material.</li>
                <li><strong>Hate Speech:</strong> Promoting violence or discrimination against groups based on religion, race, caste, gender, or sexual orientation.</li>
                <li><strong>Harassment & Threats:</strong> Stalking, cyberbullying, doxxing, or issuing direct threats.</li>
                <li><strong>Illegal Acts (IPC/IT Act violations):</strong> Initiating financial fraud, distributing narcotics, planning illegal activities, or pirating copyrighted assets.</li>
                <li><strong>System Abuse:</strong> Distributing malware, executing unauthorized bot scripts, or attempting to compromise platform infrastructure.</li>
                <li><strong>Impersonation:</strong> Deceiving users by falsely attributing an identity with malicious intent.</li>
            </ul>
        </Section>

        <Section title="Enforcement Actions">
            <p>MalluChat reserves the right to immediately terminate the session, restrict IP access, or implement technical blocks against users found violating these policies without prior warning. Suspected severe illegal activities will prompt cooperation with relevant law enforcement structures.</p>
        </Section>
    </div>
);

export const DisclaimerPage = () => (
    <div style={containerStyle} className="glass">
        <Header title="Legal Disclaimer & Grievance Protocol" />
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}><em>Effective Date: February 2026</em></p>

        <Section title="Neutral Technological Intermediary">
            <p>MalluChat operates strictly as a neutral technology provider allowing decentralized user communication. We do not initiate, select, or modify any user transmissions. We do not monitor private peer-to-peer communications. Public chat is transient and not archived. Use of the platform is at the user&apos;s own risk.</p>
        </Section>

        <Section title="Grievance Officer (India Compliance)">
            <p>In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the name and contact details of the Grievance Officer are published below:</p>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--primary)', marginTop: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Grievance Officer Contact Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <strong style={{ color: '#fff' }}>Name:</strong>
                    <span>[Grievance Officer Name]</span>

                    <strong style={{ color: '#fff' }}>Designation:</strong>
                    <span>Chief Grievance Officer</span>

                    <strong style={{ color: '#fff' }}>Email:</strong>
                    <a href="mailto:grievance@malluchat.online" style={{ color: 'var(--primary)', textDecoration: 'none' }}>grievance@malluchat.online</a>

                    <strong style={{ color: '#fff' }}>Jurisdiction:</strong>
                    <span>Republic of India</span>
                </div>
            </div>

            <p style={{ marginTop: '1rem' }}><strong>Complaint Submission Requirements:</strong><br />
                When submitting a complaint, the complainant must provide a clear description of the alleged violation, exact timestamps, context, and an electronic signature.</p>

            <p style={{ marginTop: '0.5rem' }}><strong>Resolution Timeline:</strong><br />
                We shall acknowledge the complaint within twenty-four (24) hours of receipt and endeavor to resolve concerns within seventy-two (72) hours, or escalate them in cooperation with lawful governmental requests as required under applicable law.</p>
        </Section>
    </div>
);
