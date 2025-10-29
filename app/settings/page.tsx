'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

export default function SettingsRealPage() {
  const router = useRouter();
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [imageAPIs, setImageAPIs] = useState<any[]>([]);
  const [aiModels, setAIModels] = useState<any[]>([]);
  const [wordpressBlogs, setWordpressBlogs] = useState<any[]>([]);
  const [currentEditingAPI, setCurrentEditingAPI] = useState<number | null>(null);
  const [currentEditingPlatform, setCurrentEditingPlatform] = useState<number | null>(null);

  // Form states
  const [apiForm, setApiForm] = useState({
    service: '',
    key: '',
    endpoint: ''
  });

  const [platformForm, setPlatformForm] = useState({
    id: 0,
    name: '',
    apiUrl: '',
    apiKey: '',
    username: ''
  });

  const [imageAPIForm, setImageAPIForm] = useState({
    keyName: '',
    apiKey: ''
  });

  const [aiModelForm, setAIModelForm] = useState({
    index: -1,
    name: '',
    value: '',
    provider: 'ollama',
    icon: 'fas fa-cube',
    color: '#00A67E',
    apiKey: '',
    apiKeyName: ''
  });

  const [wpForm, setWPForm] = useState({
    name: '',
    url: '',
    username: '',
    password: ''
  });

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setThemeState(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAPIKeys();
    loadPlatforms();
  }, []);

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const loadAPIKeys = async () => {
    try {
      const response = await fetch('/api/settings?category=ai_api');
      const result = await response.json();
      setApiKeys(result.data || []);
    } catch (error) {
      console.error('API 키 로드 오류:', error);
      setApiKeys([]);
    }
  };

  const loadPlatforms = async () => {
    try {
      const response = await fetch('/api/platforms');
      const result = await response.json();
      if (result.data && result.data.length === 0) {
        await createDefaultPlatforms();
        loadPlatforms();
      } else {
        setPlatforms(result.data || []);
      }
    } catch (error) {
      console.error('플랫폼 로드 실패:', error);
    }
  };

  const createDefaultPlatforms = async () => {
    const defaultPlatforms = [
      { platform_name: 'wordpress', display_name: 'WordPress' },
      { platform_name: 'medium', display_name: 'Medium' },
      { platform_name: 'tistory', display_name: 'Tistory' },
      { platform_name: 'brunch', display_name: 'Brunch' }
    ];

    for (const platform of defaultPlatforms) {
      try {
        await fetch('/api/platforms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...platform,
            config: {},
            is_enabled: false
          })
        });
      } catch (error) {
        console.error('기본 플랫폼 생성 실패:', error);
      }
    }
  };

  const loadImageAPIs = async () => {
    try {
      const response = await fetch('/api/settings?category=image_api');
      const settings = await response.json();
      setImageAPIs(settings);
    } catch (error) {
      console.error('이미지 API 로드 실패:', error);
    }
  };

  const loadAIModels = async () => {
    try {
      const response = await fetch('/api/settings?category=ai_models');
      const settings = await response.json();

      let models = [];
      const modelsSetting = settings.find((s: any) => s.key === 'AI_MODELS_LIST');
      if (modelsSetting && modelsSetting.value) {
        try {
          models = JSON.parse(modelsSetting.value);
        } catch (e) {
          console.error('모델 목록 파싱 실패:', e);
        }
      }

      if (models.length === 0) {
        models = [
          { value: 'llama', name: 'DeepSeek Coder V2 16B', provider: 'ollama', icon: 'fas fa-cube', color: '#00A67E' },
          { value: 'qwen', name: 'Qwen3 Coder 30B', provider: 'ollama', icon: 'fas fa-cube', color: '#00A67E' },
          { value: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'google', icon: 'fab fa-google', color: '#4285F4' },
          { value: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'google', icon: 'fab fa-google', color: '#4285F4' }
        ];
      }

      setAIModels(models);
    } catch (error) {
      console.error('AI 모델 로드 실패:', error);
    }
  };

  const loadWordPressBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      const blogs = await response.json();
      setWordpressBlogs(blogs.filter((b: any) => b.platform === 'wordpress'));
    } catch (error) {
      console.error('WordPress 블로그 로드 실패:', error);
    }
  };

  const saveAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const { service, key, endpoint } = apiForm;

    if (!service || !key) {
      alert('서비스와 API 키를 입력해주세요.');
      return;
    }

    try {
      const keyName = service.toUpperCase() + '_API_KEY';
      const params = new URLSearchParams({
        key: keyName,
        value: key,
        category: 'ai_api',
        is_secret: 'true',
        description: endpoint || ''
      });

      const response = await fetch(`/api/settings/upsert?${params.toString()}`, {
        method: 'POST'
      });

      const result = await response.json();
      if (result.status === 'success') {
        alert('API 키가 저장되었습니다!');
        setActiveModal(null);
        setApiForm({ service: '', key: '', endpoint: '' });
        loadAPIKeys();
      } else {
        alert('API 키 저장 실패');
      }
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      alert('API 키 저장 중 오류가 발생했습니다.');
    }
  };

  const deleteAPIKey = async (apiKey: string) => {
    if (!confirm(`${apiKey}를 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/settings/${apiKey}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('API 키가 삭제되었습니다!');
        loadAPIKeys();
      } else {
        alert('API 키 삭제 실패');
      }
    } catch (error) {
      console.error('API 키 삭제 오류:', error);
      alert('API 키 삭제 중 오류가 발생했습니다.');
    }
  };

  const editAPIKey = async (apiKey: string) => {
    try {
      const response = await fetch(`/api/settings/${apiKey}`);
      const setting = await response.json();
      const service = apiKey.replace('_API_KEY', '').toLowerCase();

      setApiForm({
        service,
        key: setting.value || '',
        endpoint: setting.description || ''
      });
      setActiveModal('apiEdit');
    } catch (error) {
      console.error('API 키 로드 오류:', error);
      alert('API 키를 불러올 수 없습니다.');
    }
  };

  const saveImageAPI = async () => {
    const { keyName, apiKey } = imageAPIForm;

    if (!apiKey) {
      alert('API 키를 입력해주세요.');
      return;
    }

    try {
      const params = new URLSearchParams({
        key: keyName,
        value: apiKey,
        category: 'image_api',
        is_secret: 'true'
      });

      const response = await fetch(`/api/settings/upsert?${params.toString()}`, {
        method: 'POST'
      });

      const result = await response.json();
      if (result.status === 'success') {
        alert('이미지 API가 저장되었습니다!');
        setActiveModal(null);
        setImageAPIForm({ keyName: '', apiKey: '' });
        loadImageAPIs();
      } else {
        alert('저장 실패: ' + (result.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const saveAIModel = async () => {
    const { index, name, value, provider, icon, color, apiKey, apiKeyName } = aiModelForm;

    if (!name || !value) {
      alert('모델 이름과 값을 입력해주세요.');
      return;
    }

    const keyName = apiKeyName || `${provider.toUpperCase()}_API_KEY`;
    const newModel = { value, name, provider, icon, color, apiKeyName: keyName };

    let models = [...aiModels];
    if (index >= 0) {
      models[index] = newModel;
    } else {
      models.push(newModel);
    }

    try {
      const modelParams = new URLSearchParams({
        key: 'AI_MODELS_LIST',
        value: JSON.stringify(models),
        category: 'ai_models',
        is_secret: 'false',
        description: 'AI 모델 목록'
      });

      const modelResponse = await fetch(`/api/settings/upsert?${modelParams.toString()}`, {
        method: 'POST'
      });

      const modelResult = await modelResponse.json();

      if (apiKey) {
        const apiParams = new URLSearchParams({
          key: keyName,
          value: apiKey,
          category: 'ai_api',
          is_secret: 'true',
          description: `${name} API Key`
        });

        await fetch(`/api/settings/upsert?${apiParams.toString()}`, {
          method: 'POST'
        });
      }

      if (modelResult.status === 'success') {
        alert('AI 모델이 저장되었습니다!');
        setActiveModal(null);
        setAIModelForm({
          index: -1,
          name: '',
          value: '',
          provider: 'ollama',
          icon: 'fas fa-cube',
          color: '#00A67E',
          apiKey: '',
          apiKeyName: ''
        });
        loadAIModels();
      } else {
        alert('저장 실패: ' + modelResult.message);
      }
    } catch (error) {
      console.error('AI 모델 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const deleteAIModel = async (index: number) => {
    if (!confirm('이 모델을 삭제하시겠습니까?')) return;

    try {
      let models = [...aiModels];
      models.splice(index, 1);

      const params = new URLSearchParams({
        key: 'AI_MODELS_LIST',
        value: JSON.stringify(models),
        category: 'ai_models',
        is_secret: 'false',
        description: 'AI 모델 목록'
      });

      const response = await fetch(`/api/settings/upsert?${params.toString()}`, {
        method: 'POST'
      });

      const result = await response.json();
      if (result.status === 'success' || response.ok) {
        alert('AI 모델이 삭제되었습니다!');
        loadAIModels();
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      console.error('AI 모델 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const saveWordPressBlog = async () => {
    const { name, url, username, password } = wpForm;

    if (!name || !url || !username || !password) {
      alert('모든 필드를 입력해주세요');
      return;
    }

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          platform: 'wordpress',
          url,
          api_url: url,
          username,
          api_key: password,
          is_active: true
        })
      });

      if (response.ok) {
        alert('✅ WordPress 블로그가 추가되었습니다!');
        setWPForm({ name: '', url: '', username: '', password: '' });
        loadWordPressBlogs();
      } else {
        alert('❌ 블로그 추가 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ 오류 발생');
    }
  };

  const testWordPressConnection = async (blogId: number) => {
    try {
      const blogResponse = await fetch(`/api/blogs/${blogId}`);
      const blog = await blogResponse.json();

      const response = await fetch('/api/wordpress/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_url: blog.api_url,
          username: blog.username,
          app_password: blog.api_key
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ WordPress 연결 성공!');
      } else {
        alert('❌ 연결 실패: ' + result.message);
      }
    } catch (error) {
      alert('❌ 연결 테스트 오류');
    }
  };

  const handleBackup = () => {
    const drafts = localStorage.getItem('blog-drafts') || '[]';
    const posts = localStorage.getItem('blog-posts') || '[]';
    const apiKeys = localStorage.getItem('api-keys') || '[]';

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        drafts: JSON.parse(drafts),
        posts: JSON.parse(posts),
        apiKeys: JSON.parse(apiKeys)
      }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('백업이 완료되었습니다!');
  };

  const getServiceName = (service: string) => {
    const names: { [key: string]: string } = {
      'openai': 'OpenAI (GPT-4, DALL-E)',
      'anthropic': 'Anthropic (Claude)',
      'google': 'Google (Gemini)',
      'deepseek': 'DeepSeek',
      'moonshot': 'Moonshot AI (Kimi)',
      'zhipu': 'Zhipu AI (GLM)',
      'ollama': 'Ollama (로컬 모델)'
    };
    return names[service] || service;
  };

  const getPlatformIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      'wordpress': 'wordpress',
      'medium': 'medium',
      'tistory': 'blog',
      'brunch': 'coffee'
    };
    return icons[name] || 'plug';
  };

  const getPlatformDescription = (name: string) => {
    const descriptions: { [key: string]: string } = {
      'wordpress': 'WordPress REST API를 통해 자동 발행',
      'medium': 'Medium API를 통해 자동 발행',
      'tistory': 'Tistory API를 통해 자동 발행',
      'brunch': 'Brunch API를 통해 자동 발행'
    };
    return descriptions[name] || '외부 플랫폼 연동';
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: '설정', href: '/settings' }
  ];

  return (
    <AppLayout>
      <PageHeader
        title="설정"
        breadcrumbs={breadcrumbs}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
        marginTop: '32px'
      }}>
        {/* AI 모델 관리 */}
        <div style={{
          background: 'white',
          border: '2px solid #00A67E',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #00A67E, #008060)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            marginBottom: '16px'
          }}>
            <i className="fas fa-brain"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            AI 모델 관리
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            에디터에서 사용할 AI 모델과 API 키를 통합 관리합니다
          </p>
          <button
            onClick={() => {
              loadAIModels();
              setActiveModal('aiModels');
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#00A67E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            관리하기
          </button>
        </div>

        {/* WordPress 연동 설정 */}
        <div style={{
          background: 'white',
          border: '2px solid #21759b',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #21759b, #1e6a8d)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            marginBottom: '16px'
          }}>
            <i className="fab fa-wordpress"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            WordPress 연동
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            WordPress 블로그를 추가하고 자동 발행 설정을 관리합니다
          </p>
          <button
            onClick={() => {
              loadWordPressBlogs();
              setActiveModal('wordpress');
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#21759b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            설정하기
          </button>
        </div>

        {/* 이미지 생성 API 설정 */}
        <div style={{
          background: 'white',
          border: '2px solid #9C27B0',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            marginBottom: '16px'
          }}>
            <i className="fas fa-image"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            이미지 생성 API
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            AI 이미지 생성 서비스 (DALL-E, Stable Diffusion 등)의 API 키를 관리합니다
          </p>
          <button
            onClick={() => {
              loadImageAPIs();
              setActiveModal('imageAPI');
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            관리하기
          </button>
        </div>

        {/* 플랫폼 연동 */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: '#f3f4f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#111827',
            marginBottom: '16px'
          }}>
            <i className="fas fa-plug"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            플랫폼 연동
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            WordPress, Medium, Tistory 등 외부 플랫폼을 연결합니다
          </p>
          <button
            onClick={() => {
              loadPlatforms();
              setActiveModal('platform');
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            연동하기
          </button>
        </div>

        {/* 테마 설정 */}
        <div style={{
          background: 'white',
          border: '2px solid #673AB7',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #673AB7, #512DA8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            marginBottom: '16px'
          }}>
            <i className="fas fa-palette"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            테마 설정
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            다크모드 및 화이트모드로 UI 테마를 변경합니다
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleSetTheme('light')}
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e5e7eb',
                background: theme === 'light' ? 'linear-gradient(135deg, #FFC107, #FFA000)' : 'white',
                color: theme === 'light' ? 'white' : '#333',
                borderColor: theme === 'light' ? '#FFC107' : '#e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s'
              }}
            >
              <i className="fas fa-sun" style={{ color: theme === 'light' ? 'white' : '#FFC107', marginRight: '8px' }}></i>
              화이트
            </button>
            <button
              onClick={() => handleSetTheme('dark')}
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e5e7eb',
                background: theme === 'dark' ? 'linear-gradient(135deg, #673AB7, #512DA8)' : 'white',
                color: theme === 'dark' ? 'white' : '#333',
                borderColor: theme === 'dark' ? '#673AB7' : '#e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s'
              }}
            >
              <i className="fas fa-moon" style={{ color: theme === 'dark' ? 'white' : '#673AB7', marginRight: '8px' }}></i>
              다크
            </button>
          </div>
        </div>

        {/* 알림 설정 */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          opacity: 0.6
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: '#f3f4f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#111827',
            marginBottom: '16px'
          }}>
            <i className="fas fa-bell"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            알림 설정
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: '#e5e7eb',
              color: '#6b7280',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              marginLeft: '8px'
            }}>
              준비중
            </span>
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            이메일 및 푸시 알림 설정을 관리합니다
          </p>
          <button
            onClick={() => alert('알림 설정 기능은 곧 추가될 예정입니다')}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            설정하기
          </button>
        </div>

        {/* 백업/복원 */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: '#f3f4f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#111827',
            marginBottom: '16px'
          }}>
            <i className="fas fa-database"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            백업 및 복원
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            작성한 글과 데이터를 백업하거나 복원합니다
          </p>
          <button
            onClick={handleBackup}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            백업하기
          </button>
        </div>

        {/* 계정 설정 */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          opacity: 0.6
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: '#f3f4f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#111827',
            marginBottom: '16px'
          }}>
            <i className="fas fa-user"></i>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            계정 설정
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: '#e5e7eb',
              color: '#6b7280',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              marginLeft: '8px'
            }}>
              준비중
            </span>
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            프로필 및 계정 정보를 관리합니다
          </p>
          <button
            onClick={() => alert('계정 설정 기능은 곧 추가될 예정입니다')}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            관리하기
          </button>
        </div>
      </div>

      {/* Modals */}
      {/* AI 모델 관리 모달 */}
      {activeModal === 'aiModels' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                <i className="fas fa-brain"></i> AI 모델 관리
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                에디터에서 사용할 AI 모델을 추가하거나 삭제하세요.
                추가된 모델은 뉴스 자동 생성 시 선택할 수 있습니다.
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              {aiModels.map((model, index) => (
                <div key={index} style={{
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      <i className={model.icon} style={{ color: model.color }}></i> {model.name}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{
                        fontSize: '11px',
                        color: '#6b7280'
                      }}>
                        Provider: {model.provider}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setAIModelForm({
                          index,
                          name: model.name,
                          value: model.value,
                          provider: model.provider,
                          icon: model.icon,
                          color: model.color,
                          apiKey: '',
                          apiKeyName: model.apiKeyName || `${model.provider.toUpperCase()}_API_KEY`
                        });
                        setActiveModal('aiModelEdit');
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        background: '#111827',
                        color: 'white'
                      }}
                    >
                      <i className="fas fa-edit"></i> 편집
                    </button>
                    <button
                      onClick={() => deleteAIModel(index)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        background: '#ef4444',
                        color: 'white'
                      }}
                    >
                      <i className="fas fa-trash"></i> 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setAIModelForm({
                    index: -1,
                    name: '',
                    value: '',
                    provider: 'ollama',
                    icon: 'fas fa-cube',
                    color: '#00A67E',
                    apiKey: '',
                    apiKeyName: ''
                  });
                  setActiveModal('aiModelEdit');
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: '#00A67E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-plus"></i> 새 모델 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 모델 추가/편집 모달 */}
      {activeModal === 'aiModelEdit' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                {aiModelForm.index >= 0 ? 'AI 모델 편집' : '새 AI 모델 추가'}
              </h2>
              <button
                onClick={() => setActiveModal('aiModels')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                모델 이름
              </label>
              <input
                type="text"
                placeholder="예: GPT-4o"
                value={aiModelForm.name}
                onChange={(e) => setAIModelForm({ ...aiModelForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  color: '#111827'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                모델 값 (value)
              </label>
              <input
                type="text"
                placeholder="예: gpt-4o"
                value={aiModelForm.value}
                onChange={(e) => setAIModelForm({ ...aiModelForm, value: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  color: '#111827'
                }}
              />
              <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                <i className="fas fa-info-circle"></i> API 호출 시 사용되는 모델 식별자
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                제공자 (Provider)
              </label>
              <select
                value={aiModelForm.provider}
                onChange={(e) => setAIModelForm({ ...aiModelForm, provider: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  color: '#111827'
                }}
              >
                <option value="ollama">Ollama</option>
                <option value="google">Google</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                아이콘 클래스
              </label>
              <input
                type="text"
                placeholder="예: fas fa-cube"
                value={aiModelForm.icon}
                onChange={(e) => setAIModelForm({ ...aiModelForm, icon: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  color: '#111827'
                }}
              />
              <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                <i className="fas fa-info-circle"></i> Font Awesome 아이콘 클래스
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                색상
              </label>
              <input
                type="color"
                value={aiModelForm.color}
                onChange={(e) => setAIModelForm({ ...aiModelForm, color: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                API 키 (선택)
              </label>
              <input
                type="password"
                placeholder="이 모델의 API 키를 입력하세요"
                value={aiModelForm.apiKey}
                onChange={(e) => setAIModelForm({ ...aiModelForm, apiKey: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  color: '#111827'
                }}
              />
              <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                <i className="fas fa-info-circle"></i> 제공자별 API 키
              </small>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setActiveModal('aiModels')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={saveAIModel}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#00A67E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WordPress 연동 모달 - Similar pattern for remaining modals */}
      {/* Implement remaining modals following the same inline style pattern */}
      {/* For brevity, I'll add the WordPress modal as an example */}

      {activeModal === 'wordpress' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                <i className="fab fa-wordpress" style={{ color: '#21759b' }}></i> WordPress 연동 설정
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* 등록된 블로그 목록 */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1f2937' }}>
                <i className="fas fa-list"></i> 등록된 WordPress 블로그
              </h3>
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                minHeight: '120px'
              }}>
                {wordpressBlogs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                    등록된 WordPress 블로그가 없습니다
                  </p>
                ) : (
                  wordpressBlogs.map((blog) => (
                    <div key={blog.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                          {blog.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {blog.url || 'URL 미설정'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => testWordPressConnection(blog.id)}
                          style={{
                            padding: '8px 16px',
                            background: '#00A67E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <i className="fas fa-check-circle"></i> 연결 테스트
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 새 WordPress 블로그 추가 */}
            <div style={{
              background: 'linear-gradient(135deg, #21759b 0%, #1e6a8d 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'white' }}>
                <i className="fas fa-plus-circle"></i> 새 WordPress 블로그 추가
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, opacity: 0.9 }}>
                    블로그 이름 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 내 WordPress 블로그"
                    value={wpForm.name}
                    onChange={(e) => setWPForm({ ...wpForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, opacity: 0.9 }}>
                    WordPress URL *
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-blog.com"
                    value={wpForm.url}
                    onChange={(e) => setWPForm({ ...wpForm, url: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, opacity: 0.9 }}>
                    사용자명 *
                  </label>
                  <input
                    type="text"
                    placeholder="WordPress 사용자명"
                    value={wpForm.username}
                    onChange={(e) => setWPForm({ ...wpForm, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, opacity: 0.9 }}>
                    Application Password *
                  </label>
                  <input
                    type="password"
                    placeholder="WordPress Application Password"
                    value={wpForm.password}
                    onChange={(e) => setWPForm({ ...wpForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }}
                  />
                  <small style={{ opacity: 0.8, fontSize: '12px', display: 'block', marginTop: '8px' }}>
                    WordPress 관리자 &gt; 사용자 &gt; 프로필 &gt; 애플리케이션 비밀번호에서 생성
                  </small>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={saveWordPressBlog}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'white',
                      color: '#21759b',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className="fab fa-wordpress"></i> WordPress 블로그 추가
                  </button>
                </div>
              </div>
            </div>

            {/* 도움말 */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#FFF3CD',
              borderRadius: '8px',
              borderLeft: '4px solid #FFA000'
            }}>
              <div style={{ fontWeight: 600, color: '#856404', marginBottom: '8px' }}>
                <i className="fas fa-info-circle"></i> Application Password 생성 방법
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404', fontSize: '14px', lineHeight: '1.8' }}>
                <li>WordPress 관리자 페이지 로그인</li>
                <li>사용자 → 프로필</li>
                <li>&quot;애플리케이션 비밀번호&quot; 섹션으로 스크롤</li>
                <li>새 애플리케이션 이름 입력 (예: &quot;AI 블로그&quot;)</li>
                <li>&quot;새 애플리케이션 비밀번호 추가&quot; 클릭</li>
                <li>생성된 비밀번호 복사 (공백 포함)</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 API 모달 */}
      {activeModal === 'imageAPI' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                <i className="fas fa-image"></i> 이미지 생성 API 관리
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                다양한 AI 이미지 생성 서비스의 API 키를 등록하고 관리하세요.
                에디터에서 이미지 생성 시 선택한 API가 사용됩니다.
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              {[
                { name: 'Hugging Face', key: 'HUGGINGFACE_API_KEY' },
                { name: 'DALL-E (OpenAI)', key: 'OPENAI_API_KEY' },
                { name: 'Stability AI', key: 'STABILITY_API_KEY' },
                { name: 'Replicate', key: 'REPLICATE_API_KEY' }
              ].map((api) => {
                const setting = imageAPIs.find((s) => s.key === api.key);
                const isConfigured = setting?.value && setting.value.length > 0;

                return (
                  <div key={api.key} style={{
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '4px'
                      }}>
                        <i className="fas fa-image"></i> {api.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isConfigured ? '#10b981' : '#6b7280'
                      }}>
                        {isConfigured ? '✓ 설정됨' : '⚠ 미설정'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setImageAPIForm({ keyName: api.key, apiKey: setting?.value || '' });
                          setActiveModal('imageAPIEdit');
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          background: '#111827',
                          color: 'white'
                        }}
                      >
                        <i className="fas fa-edit"></i> 편집
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f3f4f6',
              borderRadius: '12px',
              color: '#6b7280',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              <i className="fas fa-info-circle"></i> 지원되는 모든 이미지 생성 API가 표시됩니다. 각 API를 클릭하여 키를 설정하세요.
            </div>
          </div>
        </div>
      )}

      {/* 이미지 API 편집 모달 */}
      {activeModal === 'imageAPIEdit' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                이미지 API 편집
              </h2>
              <button
                onClick={() => setActiveModal('imageAPI')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                API 키
              </label>
              <input
                type="password"
                placeholder="API 키를 입력하세요"
                value={imageAPIForm.apiKey}
                onChange={(e) => setImageAPIForm({ ...imageAPIForm, apiKey: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  color: '#111827'
                }}
              />
              <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                <i className="fas fa-info-circle"></i> 보안을 위해 API 키는 마스킹되어 표시됩니다.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setActiveModal('imageAPI')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={saveImageAPI}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플랫폼 연동 모달 */}
      {activeModal === 'platform' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                <i className="fas fa-plug"></i> 플랫폼 연동 관리
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              {platforms.map((platform) => (
                <div key={platform.id} style={{
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      <i className={`fas fa-${getPlatformIcon(platform.platform_name)}`}></i> {platform.display_name}
                    </div>
                    <label style={{
                      position: 'relative',
                      width: '50px',
                      height: '26px',
                      display: 'inline-block'
                    }}>
                      <input
                        type="checkbox"
                        checked={platform.is_enabled}
                        onChange={async (e) => {
                          try {
                            const response = await fetch(`/api/platforms/${platform.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ is_enabled: e.target.checked })
                            });
                            if (response.ok) {
                              alert(e.target.checked ? '플랫폼이 활성화되었습니다' : '플랫폼이 비활성화되었습니다');
                              loadPlatforms();
                            }
                          } catch (error) {
                            console.error('플랫폼 토글 실패:', error);
                            alert('플랫폼 상태 변경에 실패했습니다');
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: platform.is_enabled ? '#111827' : '#9ca3af',
                        borderRadius: '26px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}>
                        <span style={{
                          position: 'absolute',
                          width: '20px',
                          height: '20px',
                          left: platform.is_enabled ? '27px' : '3px',
                          top: '3px',
                          background: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.3s'
                        }}></span>
                      </span>
                    </label>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '12px'
                  }}>
                    {getPlatformDescription(platform.platform_name)}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentEditingPlatform(platform.id);
                      setPlatformForm({
                        id: platform.id,
                        name: platform.display_name,
                        apiUrl: platform.config?.api_url || '',
                        apiKey: platform.config?.api_key || '',
                        username: platform.config?.username || ''
                      });
                      setActiveModal('platformEdit');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#111827',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-cog"></i> 설정
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 플랫폼 설정 모달 */}
      {activeModal === 'platformEdit' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                플랫폼 설정
              </h2>
              <button
                onClick={() => setActiveModal('platform')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`/api/platforms/${platformForm.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    config: {
                      api_url: platformForm.apiUrl,
                      api_key: platformForm.apiKey,
                      username: platformForm.username
                    }
                  })
                });

                if (response.ok) {
                  alert('플랫폼 설정이 저장되었습니다!');
                  setActiveModal('platform');
                  loadPlatforms();
                } else {
                  alert('설정 저장에 실패했습니다');
                }
              } catch (error) {
                console.error('플랫폼 설정 저장 실패:', error);
                alert('설정 저장 중 오류가 발생했습니다');
              }
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  플랫폼
                </label>
                <input
                  type="text"
                  value={platformForm.name}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f3f4f6',
                    color: '#111827',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  API URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/wp-json"
                  required
                  value={platformForm.apiUrl}
                  onChange={(e) => setPlatformForm({ ...platformForm, apiUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    color: '#111827'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  API 키 / 토큰
                </label>
                <input
                  type="password"
                  required
                  value={platformForm.apiKey}
                  onChange={(e) => setPlatformForm({ ...platformForm, apiKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    color: '#111827'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  사용자 이름 (선택사항)
                </label>
                <input
                  type="text"
                  value={platformForm.username}
                  onChange={(e) => setPlatformForm({ ...platformForm, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    color: '#111827'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal('platform')}
                  style={{
                    padding: '10px 16px',
                    background: '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    background: '#111827',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-save"></i> 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
