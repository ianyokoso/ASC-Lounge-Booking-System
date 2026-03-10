"use client";

import { useState } from "react";
import { User, Lock, Loader2, X, MessageCircle, Phone } from "lucide-react";

interface AuthModalProps {
    onSuccess: (user: any) => void;
    onClose: () => void;
}

export default function AuthModal({ onSuccess, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [discordId, setDiscordId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const body = isLogin
            ? { username, password }
            : { username, password, name, discordId, phoneNumber };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON response:", text);
                throw new Error("서버에서 올바르지 않은 응답이 왔습니다. (500/404)");
            }

            if (!res.ok) {
                throw new Error(data.error || "인증 실패");
            }

            if (isLogin) {
                onSuccess(data.user);
            } else {
                // 회원가입 후 자동 로그인
                const loginRes = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });
                const loginText = await loginRes.text();
                let loginData;
                try {
                    loginData = JSON.parse(loginText);
                } catch (e) {
                    throw new Error("회원가입은 성공했으나 자동 로그인에 실패했습니다.");
                }
                onSuccess(loginData.user);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="auth-container card">
                <button className="btn-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="auth-header">
                    <h3>{isLogin ? "임시 로그인" : "예약자 등록"}</h3>
                    <p style={{ wordBreak: 'keep-all', lineHeight: '1.6' }}>
                        {isLogin
                            ? "예약 시 사용했던 아이디와 비밀번호를 입력해주세요."
                            : (
                                <>
                                    본 서비스는 <strong>임시 아이디 체계</strong>로 운영됩니다.<br />
                                    <strong>디스코드 ID</strong>와 기억하기 쉬운 <strong>간단한 비밀번호</strong>를 사용해 주세요.
                                </>
                            )
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><User size={14} style={{ marginRight: 4 }} /> 임시 아이디</label>
                        <input
                            type="text"
                            placeholder="아이디를 입력하세요"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4 }} /> 비밀번호</label>
                        <input
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>이름</label>
                                <input
                                    type="text"
                                    placeholder="본인의 이름을 입력하세요"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><MessageCircle size={14} style={{ marginRight: 4 }} /> 디스코드 닉네임</label>
                                <input
                                    type="text"
                                    placeholder="nickname#1234"
                                    value={discordId}
                                    onChange={(e) => setDiscordId(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Phone size={14} style={{ marginRight: 4 }} /> 전화번호 <span style={{ color: '#ef4444', fontSize: '12px' }}>(필수)</span></label>
                                <input
                                    type="tel"
                                    placeholder="01012345678"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                                    required
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>
                                    * 매니저 예약 승인 시 본인 확인에 사용되며, 예약 승인/취소 알림 문자가 발송됩니다.
                                </p>
                            </div>
                        </>
                    )}

                    {error && <div className="alert alert-error">{error}</div>}

                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "로그인" : "등록 및 계속하기")}
                    </button>
                </form>

                <div className="auth-footer">
                    <button className="btn-text" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
                        {isLogin ? "처음 오셨나요? 정보 등록하기" : "이미 등록하셨나요? 로그인하기"}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    padding: 20px;
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .auth-container {
                    width: 100%;
                    max-width: 440px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    background: white;
                    padding: 40px;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .btn-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: #f8fafc;
                    border: none;
                    color: #94a3b8;
                    width: 36px;
                    height: 36px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .btn-close:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .w-full {
                    width: 100%;
                    margin-top: 10px;
                }
                .auth-header {
                    margin-bottom: 32px;
                    text-align: center;
                }
                .auth-header h3 {
                    font-size: 24px;
                    font-weight: 800;
                    margin-bottom: 8px;
                    color: #0f172a;
                    letter-spacing: -0.025em;
                }
                .auth-header p {
                    font-size: 15px;
                    color: #64748b;
                }
                .auth-footer {
                    margin-top: 24px;
                    text-align: center;
                }
                .btn-text {
                    background: none;
                    color: #4f46e5;
                    font-size: 14px;
                    font-weight: 600;
                    padding: 8px;
                    border: none;
                    cursor: pointer;
                }
                .btn-text:hover {
                    color: #4338ca;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
