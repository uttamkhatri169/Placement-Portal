const API_URL = window.location.origin;
// SUPABASE_URL and Anon Key are injected in index.html

// Using a simple state management
const state = {
    user: null,
    token: localStorage.getItem("token"),
    view: "home"
};

// DOM Elements
const contentDiv = document.getElementById("content");
const toastContainer = document.getElementById("toast-container");

// Toast Notification
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconColor = type === 'success' ? 'text-green-600' : (type === 'error' ? 'text-red-600' : 'text-amber-600');
    let bgColor = type === 'success' ? 'bg-green-100' : (type === 'error' ? 'bg-red-100' : 'bg-amber-100');

    let svgPath = type === 'success'
        ? '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>'
        : '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>';

    toast.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconColor} ${bgColor} rounded-lg">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">${svgPath}</svg>
            </div>
            <div class="text-sm font-semibold">${message}</div>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Navigation
function navigate(view) {
    state.view = view;
    render();
}

async function render() {
    contentDiv.innerHTML = '<div class="text-center mt-10"><div class="loader"></div> Loading...</div>';

    // Check Auth
    if (!state.token && state.view !== "login" && state.view !== "register") {
        state.view = "login";
    }

    switch (state.view) {
        case "login":
            contentDiv.innerHTML = renderLogin();
            break;
        case "register":
            contentDiv.innerHTML = renderRegister();
            break;
        case "dashboard":
            await renderDashboard();
            break;
        case "drives":
            await renderDrives();
            break;
        case "internships":
            await renderInternships();
            break;
        case "documents":
            renderDocuments();
            break;
        case "attendance":
            await renderAttendance();
            break;
        case "benefits":
            await renderBenefits();
            break;
        case "policy":
            renderPolicy();
            break;
        case "profile":
            await renderProfile();
            break;
        case "applications":
            await renderApplications();
            break;
        case "create-drive":
            if (state.user?.role === 'Coordinator' || state.user?.role === 'Admin') {
                // simplistic create drive form could go here
                contentDiv.innerHTML = "<p>Create Drive Form Placeholder</p>";
            } else {
                navigate('dashboard');
            }
            break;
        default:
            if (state.token) navigate("dashboard");
            else navigate("login");
    }

    updateNav();
}

function updateNav() {
    const topbar = document.getElementById("topbar");
    const navLinks = document.getElementById("nav-links");
    const sidebar = document.getElementById("sidebar");

    if (state.token) {
        navLinks.style.display = "block";
        sidebar.style.display = "flex";

        if (topbar) {
            topbar.classList.remove("hidden");

            // Update Topbar User Info
            const meta = state.user?.user_metadata || {};
            const userName = meta.full_name || state.user?.email || "User";
            const userRole = meta.role || "Student";
            const userEmail = state.user?.email || "";

            const nameEl = document.getElementById("topbar-user-name");
            if (nameEl) nameEl.textContent = userName;

            const roleEl = document.getElementById("topbar-user-role");
            if (roleEl) roleEl.textContent = userRole;

            // Mobile menu info
            const mobileName = document.getElementById("mobile-user-name");
            const mobileEmail = document.getElementById("mobile-user-email");
            if (mobileName) mobileName.textContent = userName;
            if (mobileEmail) mobileEmail.textContent = userEmail;

            // Avatar
            const avatarEl = document.getElementById("user-avatar");
            if (avatarEl) {
                const initials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                avatarEl.textContent = initials;
            }
        }
    } else {
        navLinks.style.display = "none";
        sidebar.style.display = "none";
        if (topbar) topbar.classList.add("hidden");
    }

    // Update active state in nav
    const links = navLinks.querySelectorAll("a");
    links.forEach(l => {
        if (l.getAttribute("onclick")?.includes(`'${state.view}'`)) {
            l.classList.add("bg-slate-800", "text-white");
            l.classList.remove("text-slate-300");
        } else {
            l.classList.remove("bg-slate-800", "text-white");
            l.classList.add("text-slate-300");
        }
    });
}

function toggleProfileMenu() {
    const menu = document.getElementById("profile-menu");
    if (menu) {
        menu.classList.toggle("hidden");
    }
}

// Configure closing the menu when clicking outside
window.addEventListener('click', function (e) {
    const menu = document.getElementById("profile-menu");
    const button = document.querySelector('button[onclick="toggleProfileMenu()"]');

    // Only if menu is open
    if (menu && !menu.classList.contains('hidden')) {
        // If click is outside menu AND outside the toggle button
        if (!menu.contains(e.target) && (!button || !button.contains(e.target))) {
            menu.classList.add('hidden');
        }
    }
});

// Views
function renderLogin() {
    return `
        <div class="flex items-center justify-center min-h-[80vh] fade-in">
            <div class="glass p-10 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div class="text-center mb-8">
                     <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 float shadow-lg">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                     </div>
                    <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
                    <p class="text-slate-500 mt-2">Sign in to access your placement dashboard</p>
                </div>
                
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" id="email" placeholder="student@university.edu" class="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition transition-all hover:bg-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" id="password" placeholder="••••••••" class="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition transition-all hover:bg-white">
                    </div>
                    
                    <button onclick="handleLogin()" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition transform duration-200">
                        Sign In
                    </button>
                    
                     <p class="text-center text-slate-500 text-sm mt-6">
                        Don't have an account? 
                        <a href="#" onclick="navigate('register')" class="text-blue-600 font-semibold hover:underline hover:text-blue-700">Create Account</a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderRegister() {
    return `
        <div class="flex items-center justify-center min-h-[85vh] fade-in">
            <div class="glass p-10 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden">
                 <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                 <div class="text-center mb-8">
                     <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 float shadow-lg">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                     </div>
                    <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Join the Portal</h2>
                    <p class="text-slate-500 mt-2">Create your student profile today</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" id="reg-name" placeholder="John Doe" class="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <input type="text" id="reg-dept" placeholder="e.g. CSE" class="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                    </div>
                </div>
                
                 <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" id="reg-email" placeholder="student@university.edu" class="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                </div>
                
                 <div class="mb-6">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" id="reg-password" placeholder="Create a strong password" class="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                </div>
                
                <button onclick="handleRegister()" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition transform duration-200">
                    Create Account
                </button>
                
                 <p class="text-center text-slate-500 text-sm mt-6">
                    Already have an account? 
                    <a href="#" onclick="navigate('login')" class="text-emerald-600 font-semibold hover:underline hover:text-emerald-700">Sign In</a>
                </p>
            </div>
        </div>
    `;
}

async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        showToast("Login failed: " + error.message, "error");
    } else {
        state.token = data.session.access_token;
        state.user = data.user;
        localStorage.setItem("token", state.token);

        showToast("Login successful!", "success");
        navigate("dashboard");
    }
}

async function handleRegister() {
    const name = document.getElementById("reg-name").value;
    const dept = document.getElementById("reg-dept").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    if (!name || !email || !password || !dept) {
        showToast("Please fill all fields", "warning");
        return;
    }

    try {
        // Use backend API for auto-confirmed registration
        await apiCall("/auth/signup", "POST", {
            full_name: name,
            email: email,
            password: password,
            role: "Student",
            department: dept
        });

        showToast("Registration successful! Please login.", "success");
        navigate("login");

    } catch (e) {
        showToast("Registration failed: " + e.message, "error");
    }
}

async function renderDashboard() {
    try {
        contentDiv.innerHTML = '<div class="text-center mt-10"><div class="loader"></div> Loading Dashboard...</div>';
        const [statsRes, profileRes, appsRes] = await Promise.all([
            apiCall("/dashboard/stats"),
            apiCall("/profiles/me").catch(() => ({})), // Handle empty profile
            apiCall("/applications/me").catch(() => [])
        ]);

        const userName = state.user?.user_metadata?.full_name || profileRes.users?.full_name || state.user?.email || "Student";
        const isProfileComplete = !!profileRes.id;
        const appCount = appsRes.length;
        const pendingCount = appsRes.filter(a => a.status === 'Applied' || a.status === 'Shortlisted').length;
        const offerCount = appsRes.filter(a => a.status === 'Selected').length;

        contentDiv.innerHTML = `
            <div class="mb-8 fade-in">
                <h1 class="text-3xl font-bold text-slate-800">Welcome, ${userName}!</h1>
                <p class="text-slate-500 mt-1">Department: <span class="font-semibold text-slate-700">${profileRes.users?.department || state.user?.user_metadata?.department || 'N/A'}</span></p>
            </div>

            <!-- Top Placements Showcase -->
            <div class="mb-10 fade-in">
                <div class="flex items-center gap-2 mb-4">
                    <span class="text-2xl">🏆</span>
                    <h2 class="text-xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">Star Achievers 2026</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Card 1 -->
                    <div class="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white overflow-hidden shadow-xl transform hover:scale-[1.02] transition duration-300 border border-slate-700">
                        <div class="absolute top-0 right-0 p-4 opacity-10">
                            <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        </div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-white">Riya Sharma</h3>
                                    <p class="text-slate-400 text-sm">CSE Dept.</p>
                                </div>
                                <span class="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded">Highest Pkg</span>
                            </div>
                            <div class="mt-4">
                                <p class="text-sm text-slate-300 uppercase tracking-wider">Placed At</p>
                                <h4 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Google</h4>
                                <p class="text-3xl font-bold mt-2 text-white">₹ 45 LPA</p>
                            </div>
                        </div>
                    </div>

                    <!-- Card 2 -->
                    <div class="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-lg transform hover:scale-[1.02] transition duration-300 overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition group-hover:bg-purple-100"></div>
                        <div class="relative z-10">
                            <div class="flex gap-4 items-center mb-4">
                                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">A</div>
                                <div>
                                    <h3 class="text-lg font-bold text-slate-800">Arjun Singh</h3>
                                    <p class="text-slate-500 text-xs">ECE Dept.</p>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-slate-400 uppercase">Offer From</p>
                                <h4 class="text-xl font-bold text-slate-800">Microsoft</h4>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="text-2xl font-bold text-purple-600">₹ 42 LPA</span>
                                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">SDE-1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 3 -->
                    <div class="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-lg transform hover:scale-[1.02] transition duration-300 overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition group-hover:bg-emerald-100"></div>
                        <div class="relative z-10">
                             <div class="flex gap-4 items-center mb-4">
                                <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">P</div>
                                <div>
                                    <h3 class="text-lg font-bold text-slate-800">Priya Patel</h3>
                                    <p class="text-slate-500 text-xs">IT Dept.</p>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-slate-400 uppercase">Offer From</p>
                                <h4 class="text-xl font-bold text-slate-800">Amazon</h4>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="text-2xl font-bold text-emerald-600">₹ 38 LPA</span>
                                    <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">SDE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Personal Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in">
                ${statCard("My Applications", appCount, "blue")}
                ${statCard("Pending / Active", pendingCount, "yellow")}
                ${statCard("Offers Received", offerCount, "green")}
                <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-center">
                    <p class="text-sm text-slate-500 font-semibold uppercase mb-1">Profile Status</p>
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold ${isProfileComplete ? 'text-emerald-600' : 'text-rose-500'}">
                            ${isProfileComplete ? 'Complete' : 'Incomplete'}
                        </h3>
                        ${!isProfileComplete ? `
                            <button onclick="navigate('profile')" class="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded hover:bg-brand-100 transition">
                                Update Now
                            </button>` : ''}
                    </div>
                </div>
            </div>

            <h2 class="text-xl font-bold mb-6 text-slate-800 flex items-center">
                <svg class="w-6 h-6 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                Placement Overview
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in" style="animation-delay: 0.1s">
                ${statCard("Total Students", statsRes.total_students || 0, "indigo")}
                ${statCard("Placed Students", statsRes.placed_students || 0, "emerald")}
                ${statCard("Placement %", (statsRes.placement_percentage || 0) + "%", "violet")}
            </div>
        `;
    } catch (e) {
        contentDiv.innerHTML = `<p class="text-red-500 p-4 bg-red-50 rounded">Error loading dashboard: ${e.message}</p>`;
        showToast("Error loading dashboard", "error");
    }
}

async function renderDrives() {
    try {
        const res = await apiCall("/drives");
        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-8 fade-in">
                <h1 class="text-2xl font-bold text-slate-800">Active Drives</h1>
                ${state.user?.role === 'Coordinator' ? '<button onclick="navigate(\'create-drive\')" class="bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition">New Drive</button>' : ''}
            </div>
            
            <div class="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8 flex items-start gap-4 fade-in">
                <div class="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h3 class="font-bold text-blue-900 text-lg mb-2">Important Instructions for Drives</h3>
                    <ul class="text-sm text-blue-800 space-y-1 list-disc pl-4">
                        <li>Ensure your profile is updated with the latest CGPA and skills before applying.</li>
                        <li>Once applied, attendance in the drive is mandatory. Failure to attend will lead to debarment.</li>
                        <li>Carry 2 copies of your updated resume and college ID card to all interview rounds.</li>
                        <li>Formal business attire is compulsory for all placement related activities.</li>
                    </ul>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">
                ${res.map(d => `
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition duration-200">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="text-xl font-bold text-slate-800">${d.role}</h2>
                                <p class="text-slate-600 font-medium">${d.companies?.name || 'Unknown Company'}</p>
                                <div class="flex items-center text-sm text-slate-500 mt-1 space-x-2">
                                    <span>📍 ${d.companies?.location || 'Remote'}</span>
                                    <span>•</span>
                                    <span>📅 ${d.drive_date || 'TBD'}</span>
                                </div>
                            </div>
                            <span class="bg-blue-50 text-brand-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                                ₹ ${d.package_lpa} LPA
                            </span>
                        </div>
                        
                        <div class="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                Eligible: ${d.eligibility_cgpa}+ CGPA
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="openDriveInfo('${d.id}')" class="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                                    More Info
                                </button>
                                <button onclick="applyToDrive('${d.id}')" class="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 hover:shadow transition transform hover:-translate-y-0.5">
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Store drives for modal access
        window.currentDrives = res;

    } catch (e) {
        contentDiv.innerHTML = `<p class="text-red-500">Error: ${e.message}</p>`;
        showToast("Failed to load drives", "error");
    }
}

function openDriveInfo(driveId) {
    const drive = window.currentDrives.find(d => d.id === driveId);
    if (!drive) return;

    // Remove existing modal if any
    const existingModal = document.getElementById("drive-modal");
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="drive-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 fade-in">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 relative">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <button onclick="document.getElementById('drive-modal').remove()" class="absolute top-4 right-4 text-white hover:text-gray-200">
                         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <h2 class="text-2xl font-bold">${drive.role}</h2>
                    <p class="opacity-90 text-sm mt-1">${drive.companies?.name} • ${drive.companies?.location}</p>
                </div>

                <!-- Body -->
                <div class="p-6 space-y-6">
                    
                    <!-- Key Details Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                            <p class="text-xs text-slate-500 uppercase">Package</p>
                            <p class="font-bold text-slate-800 text-lg">₹ ${drive.package_lpa} LPA</p>
                        </div>
                         <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                            <p class="text-xs text-slate-500 uppercase">Deadline</p>
                            <p class="font-bold text-slate-800 text-sm">${drive.application_deadline || 'ASAP'}</p>
                        </div>
                         <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                            <p class="text-xs text-slate-500 uppercase">CGPA Cutoff</p>
                            <p class="font-bold text-slate-800 text-lg">${drive.eligibility_cgpa}+</p>
                        </div>
                         <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                            <p class="text-xs text-slate-500 uppercase">Backlogs</p>
                            <p class="font-bold text-slate-800 text-lg">${drive.allowed_backlogs}</p>
                        </div>
                    </div>

                    <!-- Description -->
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg mb-2 border-b pb-2">Job Description & Details</h3>
                         <!-- Using a simple markdown-like parser or pre-wrap for description -->
                        <div class="prose prose-sm text-slate-600 max-w-none whitespace-pre-wrap leading-relaxed">
                            ${drive.description || "No detailed description provided."}
                        </div>
                    </div>
                    
                </div>

                <!-- Footer -->
                <div class="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                    <button onclick="document.getElementById('drive-modal').remove()" class="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition">Close</button>
                    <button onclick="applyToDrive('${drive.id}'); document.getElementById('drive-modal').remove()" class="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 shadow-lg transition transform hover:-translate-y-0.5">Apply Now</button>
                </div>

            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function renderProfile() {
    try {
        const res = await apiCall("/profiles/me");
        // Handle empty profile gracefuly
        const profile = res.id ? res : {};

        contentDiv.innerHTML = `
            <h1 class="text-2xl font-bold mb-6">Placement Profile</h1>
            <div class="bg-white p-6 rounded shadow max-w-4xl">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div class="md:col-span-2 flex space-x-4 mb-4 p-4 bg-gray-50 rounded">
                        <div class="w-1/2">
                            <label class="block text-gray-500 text-xs font-bold uppercase">Name (Editable)</label>
                            <input type="text" id="p-name" value="${profile.users?.full_name || ''}" class="w-full p-2 border rounded font-bold text-lg">
                        </div>
                        <div class="w-1/2">
                            <label class="block text-gray-500 text-xs font-bold uppercase">Department (Editable)</label>
                             <input type="text" id="p-dept" value="${profile.users?.department || ''}" class="w-full p-2 border rounded font-bold text-lg">
                        </div>
                     </div>
                     
                     <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">CGPA</label>
                        <input type="number" step="0.01" id="p-cgpa" value="${profile.cgpa || ''}" class="w-full p-2 border rounded">
                     </div>
                     <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Backlogs</label>
                        <input type="number" id="p-backlogs" value="${profile.backlogs || 0}" class="w-full p-2 border rounded">
                     </div>
                     <div class="md:col-span-2">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Skills (Comma separated)</label>
                        <input type="text" id="p-skills" value="${(profile.skills || []).join(', ')}" class="w-full p-2 border rounded placeholder-gray-400" placeholder="Python, Java, React...">
                     </div>
                     <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">LinkedIn URL</label>
                        <input type="url" id="p-linkedin" value="${profile.linkedin_url || ''}" class="w-full p-2 border rounded">
                     </div>
                     <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">GitHub URL</label>
                        <input type="url" id="p-github" value="${profile.github_url || ''}" class="w-full p-2 border rounded">
                     </div>
                     </div>
                </div>
                <button onclick="saveProfile()" class="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Save Profile</button>
            </div>
        `;
    } catch (e) {
        contentDiv.innerHTML = `<p class="text-red-500">Error loading profile: ${e.message}</p>`;
    }
}

async function createProfile() {
    contentDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-6">Create Profile</h1>
        <div class="bg-white p-6 rounded shadow max-w-2xl">
            <div class="grid grid-cols-2 gap-4">
                    <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">CGPA</label>
                    <input type="number" id="p-cgpa" class="w-full p-2 border rounded">
                    </div>
                    <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">Backlogs</label>
                    <input type="number" id="p-backlogs" value="0" class="w-full p-2 border rounded">
                    </div>
            </div>
            <button onclick="saveProfile()" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded">Save Profile</button>
        </div>
    `;
}

async function renderApplications() {
    try {
        const res = await apiCall("/applications/me");
        if (res.length === 0) {
            contentDiv.innerHTML = `
                <h1 class="text-2xl font-bold mb-4 text-slate-800">My Applications</h1>
                <div class="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center">
                    <p class="text-slate-500">You haven't applied to any drives yet.</p>
                    <button onclick="navigate('drives')" class="mt-4 text-brand-600 font-medium hover:underline">Browse Drives</button>
                </div>
            `;
            return;
        }

        contentDiv.innerHTML = `
            <div class="mb-6 slide-in">
                 <h1 class="text-2xl font-bold text-slate-800">My Applications</h1>
            </div>
            <div class="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden slide-in">
                <ul class="divide-y divide-slate-100">
                    ${res.map(app => `
                    <li class="hover:bg-slate-50 transition duration-150">
                        <div class="px-6 py-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-lg font-bold text-brand-600 truncate">${app.job_drives?.role}</p>
                                    <p class="text-sm text-slate-500">${app.job_drives?.companies?.name || 'Unknown Company'}</p>
                                </div>
                                <div class="flex flex-col items-end">
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${app.status === 'Selected' ? 'bg-green-100 text-green-800' :
                app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}">
                                        ${app.status}
                                    </span>
                                    <p class="text-xs text-slate-400 mt-1">Applied: ${new Date(app.applied_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } catch (e) {
        contentDiv.innerHTML = `<p class="text-red-500">Error: ${e.message}</p>`;
        showToast("Error loading applications", "error");
    }
}

async function applyToDrive(driveId) {
    // Custom confirm modal would be better, but standard confirm is okay for now
    if (!confirm("Are you sure you want to apply?")) return;

    try {
        await apiCall(`/applications/${driveId}`, "POST");
        showToast("Application submitted successfully!", "success");
        navigate("applications");
    } catch (e) {
        showToast("Failed to apply: " + e.message, "error");
    }
}

async function saveProfile() {
    const cgpa = document.getElementById("p-cgpa").value.trim();
    const backlogs = document.getElementById("p-backlogs").value.trim();
    const skills = document.getElementById("p-skills").value.split(',').map(s => s.trim()).filter(s => s);
    const linkedin = document.getElementById("p-linkedin").value.trim();
    const github = document.getElementById("p-github").value.trim();
    // New fields
    const fullName = document.getElementById("p-name")?.value.trim();
    const dept = document.getElementById("p-dept")?.value.trim();

    try {
        await apiCall("/profiles/", "POST", {
            full_name: fullName,
            department: dept,
            cgpa: parseFloat(cgpa),
            backlogs: parseInt(backlogs),
            skills: skills,
            linkedin_url: linkedin,
            github_url: github,
            opted_out: false,
            is_eligible: true
        });
        showToast("Profile saved successfully!", "success");
        navigate("profile");
    } catch (e) {
        showToast("Error saving profile: " + e.message, "error");
    }
}

// Helpers
async function apiCall(endpoint, method = "GET", body = null) {
    const url = `${API_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    if (state.token) options.headers["Authorization"] = `Bearer ${state.token}`;
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
        let errorMsg = `Error ${response.status}: `;
        if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            errorMsg += errData.detail || errData.message || JSON.stringify(errData);
        } else {
            errorMsg += await response.text() || response.statusText;
        }
        throw new Error(errorMsg);
    }

    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    return null;
}

async function renderInternships() {
    try {
        contentDiv.innerHTML = '<div class="text-center mt-10"><div class="loader"></div> Loading Internships...</div>';
        const res = await apiCall("/internships");
        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-8 fade-in">
                <h1 class="text-2xl font-bold text-slate-800">Internship Requests</h1>
                <button onclick="renderInternshipForm()" class="bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition">New Request</button>
            </div>

            <div class="bg-emerald-50 border border-emerald-100 p-6 rounded-xl mb-8 flex items-start gap-4 fade-in">
                <div class="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                    <h3 class="font-bold text-emerald-900 text-lg mb-2">Internship Guidelines</h3>
                    <ul class="text-sm text-emerald-800 space-y-1 list-disc pl-4">
                        <li>Internships must be of minimum 8 weeks duration to be considered for credits.</li>
                        <li>A "No Objection Certificate" (NOC) is required from the college before joining.</li>
                        <li>Weekly work logs must be submitted via the "Attendance" tab.</li>
                        <li>The company supervisor's feedback will play a crucial role in grading.</li>
                    </ul>
                </div>
            </div>

            ${res.length ? `
            <div class="bg-white shadow-sm border border-slate-100 rounded-xl overflow-hidden fade-in">
                <ul class="divide-y divide-slate-100">
                    ${res.map(r => `
                    <li class="px-6 py-5 hover:bg-slate-50 transition duration-150">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-bold text-slate-800 text-lg">${r.company_name}</h3>
                                <p class="text-sm text-slate-500">Duration: <span class="font-semibold">${r.duration_months} months</span></p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                r.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
            }">
                                ${r.status}
                            </span>
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>` : '<div class="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">No internship requests found.</div>'}
        `;
    } catch (e) {
        contentDiv.innerHTML = `<p class="text-red-500">Error: ${e.message}</p>`;
        showToast("Error loading internships", "error");
    }
}

function renderInternshipForm() {
    contentDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-6 text-slate-800">New Internship Request</h1>
        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-lg fade-in">
            <input type="text" id="int-company" placeholder="Company Name" class="w-full p-3 border border-slate-300 rounded-lg mb-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition">
            <input type="text" id="int-supervisor" placeholder="Supervisor Name (Optional)" class="w-full p-3 border border-slate-300 rounded-lg mb-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition">
            <input type="number" id="int-duration" placeholder="Duration (Months)" class="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition">
            
            <label class="flex items-center mb-6 cursor-pointer">
                <input type="checkbox" id="int-rec" class="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500">
                <span class="ml-2 text-slate-700 text-sm">Requires Recommendation Letter</span>
            </label>
            
            <div class="flex space-x-3">
                <button onclick="submitInternship()" class="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition shadow">Submit</button>
                <button onclick="navigate('internships')" class="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            </div>
        </div>
    `;
}

async function submitInternship() {
    try {
        await apiCall("/internships/", "POST", {
            company_name: document.getElementById("int-company").value,
            supervisor_name: document.getElementById("int-supervisor").value,
            duration_months: parseInt(document.getElementById("int-duration").value),
            requires_recommendation: document.getElementById("int-rec").checked
        });
        showToast("Request submitted!", "success");
        navigate("internships");
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

function renderDocuments() {
    contentDiv.innerHTML = '<div class="text-center mt-10"><div class="loader"></div> Loading Documents...</div>';
    Promise.all([
        apiCall("/documents"),
        apiCall("/documents/my").catch(() => [])
    ]).then(([sysDocs, myDocs]) => {
        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-8 fade-in">
                <h1 class="text-2xl font-bold text-slate-800">Document Repository</h1>
                <button onclick="renderUploadForm()" class="bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition">Upload Document</button>
            </div>

            <div class="bg-amber-50 border border-amber-100 p-6 rounded-xl mb-8 flex items-start gap-4 fade-in">
                <div class="p-3 bg-amber-100 text-amber-600 rounded-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                    <h3 class="font-bold text-amber-900 text-lg mb-2">Required Documents Checklist</h3>
                    <ul class="text-sm text-amber-800 space-y-1 list-disc pl-4">
                        <li><strong>Resume/CV:</strong> Updated PDF version (max 2MB).</li>
                        <li><strong>Passport Photo:</strong> Formal attire, white background.</li>
                        <li><strong>Govt ID:</strong> Aadhar or PAN card for verification.</li>
                        <li><strong>Mark Sheets:</strong> All semester grade cards combined in one PDF.</li>
                    </ul>
                </div>
            </div>


            <!-- My Documents -->
            <div class="mb-8 fade-in">
                <h2 class="text-lg font-semibold mb-4 text-slate-700 border-b border-slate-200 pb-2">My Uploads</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${myDocs.length ? myDocs.map(d => `
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition duration-200">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800">${d.title}</h3>
                                <p class="text-xs text-slate-500">${d.document_type} • ${new Date(d.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <a href="${d.file_url}" target="_blank" class="text-brand-600 hover:text-brand-800 font-medium text-sm">View</a>
                    </div>
                    `).join('') : '<p class="text-slate-500 italic p-4 bg-slate-50 rounded-lg col-span-2 text-center">No documents uploaded yet.</p>'}
                </div>
            </div>

            <!-- System Documents -->
            <div class="fade-in" style="animation-delay: 0.1s">
                <h2 class="text-lg font-semibold mb-4 text-slate-700 border-b border-slate-200 pb-2">System Documents</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${sysDocs.length ? sysDocs.map(d => `
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition duration-200">
                         <div class="flex items-center space-x-3">
                            <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800">${d.title}</h3>
                                <p class="text-xs text-slate-500">${d.category || 'General'}</p>
                            </div>
                        </div>
                        <a href="${d.file_url}" target="_blank" class="text-brand-600 hover:text-brand-800 font-medium text-sm">Download</a>
                    </div>
                    `).join('') : '<p class="text-slate-500 italic p-4 bg-slate-50 rounded-lg col-span-2 text-center">No system documents available.</p>'}
                </div>
            </div>
        `;
    }).catch(e => {
        contentDiv.innerHTML = `<p class="text-red-500">Error: ${e.message}</p>`;
        showToast("Error loading documents", "error");
    });
}

function renderUploadForm() {
    contentDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-6 text-slate-800">Upload Document</h1>
        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-lg fade-in">
            <label class="block mb-2 font-bold text-sm text-slate-700">Document Title</label>
            <input type="text" id="doc-title" placeholder="e.g. My Resume 2026" class="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition">
            
            <label class="block mb-2 font-bold text-sm text-slate-700">Document Type</label>
            <select id="doc-type" class="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white">
                <option value="CV">CV / Resume</option>
                <option value="CoverLetter">Cover Letter</option>
                <option value="Photo">Passport Size Photo</option>
                <option value="GovtId">Government ID (Aadhar/PAN)</option>
                <option value="Other">Other</option>
            </select>
            
            <label class="block mb-2 font-bold text-sm text-slate-700">Select File</label>
            <input type="file" id="doc-file" class="w-full p-3 border border-slate-300 rounded-lg mb-6 bg-slate-50 text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100">
            
            <div class="flex space-x-3">
                <button onclick="submitDocument()" class="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition shadow">Upload</button>
                <button onclick="renderDocuments()" class="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            </div>
        </div>
    `;
}

async function submitDocument() {
    try {
        const title = document.getElementById("doc-title").value;
        const type = document.getElementById("doc-type").value;
        const fileInput = document.getElementById("doc-file");

        if (!title || !fileInput.files[0]) {
            showToast("Please provide a title and select a file.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("document_type", type);
        formData.append("file", fileInput.files[0]);

        const token = localStorage.getItem("token");

        // Custom fetch to handle FormData with token
        const res = await fetch(API_URL + "/documents/upload", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Upload failed");
        }

        showToast("Document uploaded successfully!", "success");
        renderDocuments();

    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

async function renderAttendance() {
    try {
        contentDiv.innerHTML = '<div class="text-center mt-10"><div class="loader"></div> Loading Attendance...</div>';
        const res = await apiCall("/attendance");
        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-8 fade-in">
                <h1 class="text-2xl font-bold text-slate-800">Internship Attendance</h1>
                <button onclick="renderAttendanceForm()" class="bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition">Log Attendance</button>
            </div>
            ${res.length ? `
            <div class="bg-white shadow-sm border border-slate-100 rounded-xl overflow-hidden fade-in">
                <ul class="divide-y divide-slate-100">
                    ${res.map(r => `
                    <li class="px-6 py-5 hover:bg-slate-50 transition duration-150">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-slate-800">Week ${r.week_number}</h3>
                                <p class="text-sm text-slate-600 mt-1">${r.work_summary}</p>
                                <p class="text-xs text-slate-400 mt-2 flex items-center">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    Submitted: ${new Date(r.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                                ${r.approved ? 'Approved' : 'Pending'}
                            </span>
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>` : '<div class="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">No attendance records found.</div>'}
        `;
    } catch (e) {
        contentDiv.innerHTML = `<p class="text-red-500">Error: ${e.message}</p>`;
        showToast("Error loading attendance", "error");
    }
}

async function renderAttendanceForm() {
    try {
        const res = await apiCall("/internships");
        const myInternships = res.filter(r => r.status === 'Approved');

        if (myInternships.length === 0) {
            contentDiv.innerHTML = `
                <div class="bg-amber-50 p-6 rounded-xl border border-amber-200 text-amber-800 max-w-lg">
                    <h3 class="font-bold text-lg mb-2">No Active Internships</h3>
                    <p class="mb-4">You need an <strong>Approved</strong> internship request to log attendance.</p>
                    <button onclick="navigate('internships')" class="text-brand-600 font-semibold hover:underline">Go to Internships</button>
                </div>
            `;
            return;
        }

        contentDiv.innerHTML = `
            <h1 class="text-2xl font-bold mb-6 text-slate-800">Log Internship Attendance</h1>
            <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-lg fade-in">
                <label class="block mb-2 font-bold text-sm text-slate-700">Select Internship</label>
                <select id="att-internship-id" class="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white">
                    ${myInternships.map(i => `<option value="${i.id}">${i.company_name} (${i.role || 'Intern'})</option>`).join('')}
                </select>

                <label class="block mb-2 font-bold text-sm text-slate-700">Week Number</label>
                <input type="number" id="att-week" placeholder="e.g. 1" class="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition">
                
                <label class="block mb-2 font-bold text-sm text-slate-700">Work Summary</label>
                <textarea id="att-summary" rows="4" placeholder="Describe tasks completed..." class="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"></textarea>
                
                <div class="flex space-x-3">
                    <button onclick="submitAttendance()" class="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition shadow">Submit Log</button>
                    <button onclick="renderAttendance()" class="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                </div>
            </div>
        `;
    } catch (e) {
        showToast("Error loading form: " + e.message, "error");
    }
}

async function submitAttendance() {
    try {
        const internshipId = document.getElementById("att-internship-id").value;
        if (!internshipId) return showToast("Please select an internship", "warning");

        await apiCall("/attendance/", "POST", {
            internship_id: internshipId,
            week_number: parseInt(document.getElementById("att-week").value),
            work_summary: document.getElementById("att-summary").value
        });
        showToast("Attendance logged!", "success");
        renderAttendance();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

async function renderBenefits() {
    try {
        const res = await apiCall("/benefits");
        contentDiv.innerHTML = `
             <div class="flex justify-between items-center mb-8 fade-in">
                <h1 class="text-2xl font-bold text-slate-800">Academic Benefit Requests</h1>
                <button onclick="renderBenefitForm()" class="bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition">New Request</button>
            </div>

            <div class="bg-purple-50 border border-purple-100 p-6 rounded-xl mb-8 flex items-start gap-4 fade-in">
                <div class="p-3 bg-purple-100 text-purple-600 rounded-lg">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div>
                    <h3 class="font-bold text-purple-900 text-lg mb-2">Benefit Types</h3>
                    <ul class="text-sm text-purple-800 space-y-1 list-disc pl-4">
                        <li><strong>Attendance Waiver:</strong> For days spent in interviews or official internship work.</li>
                        <li><strong>Exam Reschedule:</strong> If a drive clashes with an internal assessment (requires proof).</li>
                        <li><strong>Credit Transfer:</strong> For recognized MOOCs or external projects (prior approval needed).</li>
                    </ul>
                </div>
            </div>

            ${res.length ? `
            <div class="bg-white shadow-sm border border-slate-100 rounded-xl overflow-hidden fade-in">
                 <ul class="divide-y divide-slate-100">
                    ${res.map(r => `
                    <li class="px-6 py-5 hover:bg-slate-50 transition duration-150">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-slate-800">${r.benefit_type}</h3>
                                <p class="text-sm text-slate-600 mt-1">${r.reason}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                                ${r.approved ? 'Approved' : 'Pending'}
                            </span>
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>` : '<div class="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">No benefit requests found.</div>'}
        `;
    } catch (e) {
        contentDiv.innerHTML = `<p class="text-red-500">Error: ${e.message}</p>`;
        showToast("Error loading benefits", "error");
    }
}

function renderBenefitForm() {
    contentDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-6 text-slate-800">Request Academic Benefit</h1>
        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-lg fade-in">
            <label class="block mb-2 font-bold text-sm text-slate-700">Benefit Type</label>
            <select id="ben-type" class="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white">
                <option>Attendance Waiver</option>
                <option>Exam Reschedule</option>
                <option>Credit Transfer</option>
                <option>Other</option>
            </select>
            
            <label class="block mb-2 font-bold text-sm text-slate-700">Reason / Justification</label>
            <textarea id="ben-reason" rows="4" class="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"></textarea>
            
            <div class="flex space-x-3">
                <button onclick="submitBenefit()" class="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition shadow">Submit Request</button>
                <button onclick="renderBenefits()" class="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            </div>
        </div>
    `;
}

async function submitBenefit() {
    try {
        await apiCall("/benefits/", "POST", {
            benefit_type: document.getElementById("ben-type").value,
            reason: document.getElementById("ben-reason").value
        });
        showToast("Request submitted!", "success");
        renderBenefits();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

function renderPolicy() {
    contentDiv.innerHTML = `
        <div class="fade-in">
            <h1 class="text-3xl font-bold text-slate-800 mb-6">Placement Policy & Rules</h1>
            
            <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-8">
                
                <!-- Section 1: Eligibility -->
                <section>
                    <h2 class="text-xl font-bold text-slate-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">01</span>
                        Eligibility Criteria
                    </h2>
                    <ul class="list-disc pl-14 space-y-2 text-slate-600">
                        <li><strong>CGPA Cutoff:</strong> Students must maintain a minimum CGPA of 6.0 to be eligible for placement drives. Specific companies may have higher cutoffs (e.g., 7.5+).</li>
                        <li><strong>Backlogs:</strong> Students with active backlogs are generally not eligible, unless specified otherwise by a company.</li>
                        <li><strong>Attendance:</strong> A minimum of 75% attendance in academic sessions constitutes basic eligibility.</li>
                    </ul>
                </section>

                <hr class="border-slate-100">

                <!-- Section 2: Application Rules -->
                <section>
                    <h2 class="text-xl font-bold text-slate-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3 text-sm">02</span>
                        Application Rules
                    </h2>
                    <ul class="list-disc pl-14 space-y-2 text-slate-600">
                        <li><strong>One Student One Job:</strong> Once a student receives an offer, they are effectively out of the placement process for other companies, unless the new offer is in a "Dream" category (2x package).</li>
                        <li><strong>No Show:</strong> If a student applies for a drive but fails to attend without a valid reason, they will be debarred from the next 3 placement drives.</li>
                        <li><strong>Resume Honesty:</strong> Any discrepancy found in the resume regarding grades or skills will lead to immediate disqualification.</li>
                    </ul>
                </section>

                <hr class="border-slate-100">

                <!-- Section 3: Code of Conduct -->
                <section>
                    <h2 class="text-xl font-bold text-slate-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-3 text-sm">03</span>
                        Code of Conduct
                    </h2>
                    <div class="pl-14 text-slate-600 space-y-2">
                        <p>Students must appear for interviews in formal attire.</p>
                        <p>Direct contact with company HRs is strictly prohibited unless authorized by the Placement Cell.</p>
                        <p>Students must carry their college ID cards at all times during the process.</p>
                    </div>
                </section>

                <div class="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
                    <svg class="w-6 h-6 text-amber-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <div>
                        <h4 class="font-bold text-amber-800">Important Note</h4>
                        <p class="text-sm text-amber-700 mt-1">The Placement Cell reserves the right to modify these policies at any time. Check this page regularly for updates.</p>
                    </div>
                </div>

            </div>
        </div>
    `;


}

// Helper: Navbar Update
function toggleSidebar() {
    // toggle logic if needed for mobile
}

function statCard(title, value, color = "blue") {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        yellow: "bg-amber-50 text-amber-600 border-amber-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-teal-50 text-teal-600 border-teal-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100"
    };

    // Fallback if color not found
    const theme = colors[color] || colors.blue;

    return `
        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
            <div class="flex items-center space-x-4">
                <div class="p-3 rounded-full ${theme} bg-opacity-50">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
                <div>
                    <p class="text-slate-500 text-sm font-medium uppercase tracking-wide">${title}</p>
                    <h3 class="text-2xl font-bold text-slate-800">${value}</h3>
                </div>
            </div>
        </div>
    `;
}

async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Login failed: " + error.message);
        return;
    }

    state.token = data.session.access_token;
    localStorage.setItem("token", state.token);
    state.user = data.user;

    // Ideally fetch backend role match here
    navigate("dashboard");
}

async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    state.token = null;
    state.user = null;
    navigate("login");
}

// Init
window.addEventListener("load", async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
        state.token = data.session.access_token;
        state.user = data.session.user;
        // In reality, we often validated the token with backend to get the 'role'
        // For now, we trust the session or would need a /me endpoint that returns user+role
    }
    render();
});
