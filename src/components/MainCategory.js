import React, { useState, useEffect } from 'react';
import '../styles/MainCategory.css';
import imageee from "../assets/lookit.png"
import Loder from './Loder';

function MainCategory() {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const limitText = (text, max = 50) => {
        if (!text) return "";
        return text.length > max ? text.substring(0, max) + "..." : text;
    };
    const categoryTitles = {
        '157': 'INFORMATION',
        '158': 'HEALTH',
        '160': 'WOMENS CHOICE',
        '172': 'EDUCATION',
        '178': 'TECHTIPS',
        '185': 'LAW',
        '190': 'STORY SPOT',
        '195': 'HOW TO APPLY',
        '200': 'SUCCESS STORY',
        '202': 'MOTIVATION',
        '210': 'AI PROMPTS',
        '214': 'SPORTS',
        '224': 'UPDATES'
    };
    useEffect(() => {
        fetchPosts();
    }, []);
    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('https://tnreaders.in/api/user/mainhomepost');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setApiResponse(data);
            const processedCategories = {};
            if (data.homepageposts && typeof data.homepageposts === 'object') {
                Object.keys(data.homepageposts).forEach(categoryId => {
                    const categoryData = data.homepageposts[categoryId];
                    // Check if this category has a 'posts' property that is an array
                    if (categoryData && categoryData.posts && Array.isArray(categoryData.posts) && categoryData.posts.length > 0) {
                        const posts = categoryData.posts;
                        const categoryName = categoryTitles[categoryId] || posts[0]?.category?.name || `Category ${categoryId}`;
                        const categoryImage = posts[0]?.category?.FullImgPath;

                        processedCategories[categoryId] = {
                            id: categoryId,
                            name: categoryName,
                            image: categoryImage,
                            posts: posts,
                            categoryInfo: posts[0]?.category
                        };
                    }
                });
            }
            setCategories(processedCategories);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
            setLoading(false);
        }
    };
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };
    const DebugInfo = () => (
        <details className="debug-info">
            <summary>API Response (Debug)</summary>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </details>
    );
    const PostCard = ({ post }) => (
        <article className="post-cardm">
            <div className="post-imagem">
                <img
                    src={
                        post.web_thumbnail ||
                        post.FullImgPath ||
                        post.img ||
                        imageee ||
                        "/assets/lookit.png"
                    }
                    alt="post-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/lookit.png";
                    }}
                />
            </div>
            <div className="post-contentm">
                <h3 className="post-titlem">{limitText(post.title, 25)}</h3>
                <div className="post-metam">
                    <span className="post-date">
                        {formatDate(post.created_at)}
                    </span>
                </div>
                <div className="post-actions">
                    <a
                        href={post.BlogURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-more-btn"
                    >
                        Read More
                    </a>
                </div>
            </div>
        </article>
    );
    const CategorySection = ({ categoryId, categoryData }) => (
        <>
            <section key={categoryId} className="category-section">
                <div className="category-headerm">
                    <div className="category-title-wrapper">
                        <h2 className="category-title">{categoryData.name}</h2>
                    </div>
                </div>
                <div className="posts-gridm">
                    {categoryData.posts.map((post, index) => (
                        <PostCard key={`${post.id}-${index}`} post={post} />
                    ))}
                </div>
            </section>
        </>
    );
    if (loading) {
        return (
            <Loder />
        );
    }
    if (error) {
        return (
            <div className="error">
                <h2>Error Loading Content</h2>
                <p>{error}</p>
                <button onClick={fetchPosts} className="retry-btn">Try Again</button>
                {apiResponse && <DebugInfo />}
            </div>
        );
    }
    return (
        <div className="App">
            <h1>LookIt Main Category</h1>
            <main className="main-contentmain">
                {Object.keys(categories).length === 0 ? (
                    <div className="no-posts">
                        <h2>No Posts Available</h2>
                        <p>No posts were found in the API response.</p>
                        <button onClick={fetchPosts} className="retry-btn">Retry</button>
                        {apiResponse && <DebugInfo />}
                    </div>
                ) : (
                    <div className="categories-container">
                        {Object.keys(categories).map(categoryId => (
                            <CategorySection
                                key={categoryId}
                                categoryId={categoryId}
                                categoryData={categories[categoryId]}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
export default MainCategory;