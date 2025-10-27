// LocalStorage 기반 데이터 관리자
class DataManager {
    constructor() {
        this.storageKeys = {
            posts: 'blog_posts',
            drafts: 'blog_drafts',
            categories: 'blog_categories',
            ideas: 'blog_ideas',
            stats: 'blog_stats',
            settings: 'blog_settings',
            news: 'blog_news',
            schedule: 'blog_schedule'
        };
        this.initializeData();
    }

    initializeData() {
        // 초기 데이터 설정
        if (!localStorage.getItem(this.storageKeys.posts)) {
            localStorage.setItem(this.storageKeys.posts, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.categories)) {
            const defaultCategories = ['기술', 'AI', '마케팅', '라이프스타일', '비즈니스'];
            localStorage.setItem(this.storageKeys.categories, JSON.stringify(defaultCategories));
        }
        if (!localStorage.getItem(this.storageKeys.stats)) {
            const initialStats = {
                totalViews: 0,
                totalPosts: 0,
                subscribers: 0,
                engagementRate: 0,
                monthlyViews: [],
                popularPosts: []
            };
            localStorage.setItem(this.storageKeys.stats, JSON.stringify(initialStats));
        }
    }

    // 포스트 관리
    saveDraft(post) {
        const drafts = this.getDrafts();
        post.id = post.id || Date.now().toString();
        post.createdAt = post.createdAt || new Date().toISOString();
        post.updatedAt = new Date().toISOString();
        post.status = 'draft';
        
        const existingIndex = drafts.findIndex(d => d.id === post.id);
        if (existingIndex !== -1) {
            drafts[existingIndex] = post;
        } else {
            drafts.push(post);
        }
        
        localStorage.setItem(this.storageKeys.drafts, JSON.stringify(drafts));
        return post;
    }

    publishPost(post) {
        const posts = this.getPosts();
        post.id = post.id || Date.now().toString();
        post.publishedAt = new Date().toISOString();
        post.status = 'published';
        post.views = 0;
        post.likes = 0;
        post.comments = [];
        
        posts.unshift(post);
        localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
        
        // 통계 업데이트
        this.updateStats('totalPosts', 1);
        
        // 임시저장에서 제거
        if (post.draftId) {
            this.deleteDraft(post.draftId);
        }
        
        return post;
    }

    getPosts() {
        return JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
    }

    getDrafts() {
        return JSON.parse(localStorage.getItem(this.storageKeys.drafts) || '[]');
    }

    getPostById(id) {
        const posts = this.getPosts();
        return posts.find(p => p.id === id);
    }

    updatePost(id, updates) {
        const posts = this.getPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
            return posts[index];
        }
        return null;
    }

    deletePost(id) {
        const posts = this.getPosts();
        const filtered = posts.filter(p => p.id !== id);
        localStorage.setItem(this.storageKeys.posts, JSON.stringify(filtered));
        this.updateStats('totalPosts', -1);
    }

    deleteDraft(id) {
        const drafts = this.getDrafts();
        const filtered = drafts.filter(d => d.id !== id);
        localStorage.setItem(this.storageKeys.drafts, JSON.stringify(filtered));
    }

    // 카테고리 관리
    getCategories() {
        return JSON.parse(localStorage.getItem(this.storageKeys.categories) || '[]');
    }

    addCategory(category) {
        const categories = this.getCategories();
        if (!categories.includes(category)) {
            categories.push(category);
            localStorage.setItem(this.storageKeys.categories, JSON.stringify(categories));
        }
        return categories;
    }

    // 아이디어 관리
    saveIdea(idea) {
        const ideas = this.getIdeas();
        idea.id = Date.now().toString();
        idea.createdAt = new Date().toISOString();
        ideas.unshift(idea);
        localStorage.setItem(this.storageKeys.ideas, JSON.stringify(ideas));
        return idea;
    }

    getIdeas() {
        return JSON.parse(localStorage.getItem(this.storageKeys.ideas) || '[]');
    }

    // 통계 관리
    getStats() {
        return JSON.parse(localStorage.getItem(this.storageKeys.stats) || '{}');
    }

    updateStats(key, increment = 1) {
        const stats = this.getStats();
        if (typeof stats[key] === 'number') {
            stats[key] += increment;
        } else {
            stats[key] = increment;
        }
        localStorage.setItem(this.storageKeys.stats, JSON.stringify(stats));
        return stats;
    }

    incrementViews(postId) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.views = (post.views || 0) + 1;
            localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
            this.updateStats('totalViews', 1);
        }
    }

    // 뉴스 관리
    saveNews(newsItems) {
        const existing = this.getNews();
        const combined = [...newsItems, ...existing];
        // 중복 제거 (제목 기준)
        const unique = combined.filter((item, index, self) =>
            index === self.findIndex((t) => t.title === item.title)
        );
        localStorage.setItem(this.storageKeys.news, JSON.stringify(unique.slice(0, 100)));
        return unique;
    }

    getNews() {
        return JSON.parse(localStorage.getItem(this.storageKeys.news) || '[]');
    }

    // 일정 관리
    saveSchedule(schedule) {
        const schedules = this.getSchedules();
        schedule.id = Date.now().toString();
        schedule.createdAt = new Date().toISOString();
        schedules.push(schedule);
        localStorage.setItem(this.storageKeys.schedule, JSON.stringify(schedules));
        return schedule;
    }

    getSchedules() {
        return JSON.parse(localStorage.getItem(this.storageKeys.schedule) || '[]');
    }

    // 설정 관리
    getSettings() {
        return JSON.parse(localStorage.getItem(this.storageKeys.settings) || '{}');
    }

    saveSettings(settings) {
        localStorage.setItem(this.storageKeys.settings, JSON.stringify(settings));
        return settings;
    }

    // 대시보드 데이터
    getDashboardData() {
        const posts = this.getPosts();
        const drafts = this.getDrafts();
        const stats = this.getStats();
        
        // 최근 30일 데이터 계산
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentPosts = posts.filter(p => 
            new Date(p.publishedAt) > thirtyDaysAgo
        );
        
        // 인기 포스트 (조회수 기준)
        const popularPosts = [...posts]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
        
        return {
            totalViews: stats.totalViews || 0,
            publishedPosts: posts.length,
            drafts: drafts.length,
            subscribers: stats.subscribers || 0,
            engagementRate: stats.engagementRate || 0,
            recentPosts: recentPosts.length,
            popularPosts: popularPosts,
            categories: this.getCategories(),
            recentActivity: this.getRecentActivity()
        };
    }

    getRecentActivity() {
        const posts = this.getPosts();
        const drafts = this.getDrafts();
        const ideas = this.getIdeas();
        
        const activities = [];
        
        // 최근 포스트
        posts.slice(0, 3).forEach(post => {
            activities.push({
                type: 'post',
                title: post.title,
                date: post.publishedAt,
                icon: 'fa-file-text'
            });
        });
        
        // 최근 임시저장
        drafts.slice(0, 2).forEach(draft => {
            activities.push({
                type: 'draft',
                title: draft.title,
                date: draft.updatedAt,
                icon: 'fa-pencil'
            });
        });
        
        // 활동 정렬 (최신순)
        return activities.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 5);
    }
}

// 전역 객체로 export
window.dataManager = new DataManager();