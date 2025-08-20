# Contributing to Krishi Vikas

Thank you for your interest in contributing to Krishi Vikas! 🌱 We're excited to have you as part of our community working to revolutionize farming through AI technology. This guide will walk you through everything you need to know to make your first contribution, whether you're a complete beginner or an experienced developer.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Understanding Our Workflow](#understanding-our-workflow)
- [Making Your First Contribution](#making-your-first-contribution)
- [Detailed Contribution Process](#detailed-contribution-process)
- [Guidelines and Standards](#guidelines-and-standards)
- [Review Process](#review-process)
- [Community and Support](#community-and-support)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We are committed to providing a welcoming and inspiring community for all.

### Our Standards
- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them learn
- **Be collaborative**: Work together toward common goals
- **Be patient**: Remember everyone is learning and growing
- **Be constructive**: Provide helpful feedback and solutions

## 🚀 Getting Started

### Who Can Contribute?

**Everyone!** Whether you're:
- 🆕 A complete beginner to programming
- 👨‍💻 An experienced developer
- 🎨 A designer or UX expert
- 📝 Someone who loves writing documentation
- 🌾 A farmer or agricultural expert
- 🧪 A tester who finds bugs

### What Can You Contribute?

- **Code**: Bug fixes, new features, performance improvements
- **Documentation**: README updates, guides, API docs
- **Design**: UI/UX improvements, icons, graphics
- **Testing**: Finding bugs, writing tests, user testing
- **Ideas**: Feature suggestions, architectural improvements
- **Community**: Helping others, answering questions

## 🛠️ Development Setup

### Prerequisites

Make sure you have these installed on your computer:

#### 1. Node.js and npm
- Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)
- Verify installation:
  ```bash
  node --version  # Should be 14.0.0 or higher
  npm --version   # Should be 6.0.0 or higher
  ```

#### 2. Git
- **Windows**: Download from [git-scm.com](https://git-scm.com/download/win)
- **Mac**: `brew install git` or download from git-scm.com
- **Linux**: `sudo apt install git` (Ubuntu/Debian)
- Verify: `git --version`

#### 3. GitHub Account
- Sign up at [github.com](https://github.com) if you don't have one
- Set up your profile with a clear username and profile picture

#### 4. Code Editor (Recommended)
- **VS Code**: [code.visualstudio.com](https://code.visualstudio.com/) (free)
- Install useful extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - GitLens
  - Auto Rename Tag

### Initial Setup

#### 1. Configure Git (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 2. Set up SSH (Recommended)
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key and add to GitHub
cat ~/.ssh/id_ed25519.pub
```
Then add the key to your GitHub account in Settings > SSH and GPG keys.

## 🔄 Understanding Our Workflow

We use **Git Flow** with these main branches:

- **`main`**: Production-ready code (protected)
- **`dev`**: Development branch where features are integrated
- **`feature/*`**: Individual feature branches
- **`hotfix/*`**: Critical bug fixes
- **`release/*`**: Release preparation branches

**Important**: All pull requests should target the `dev` branch, not `main`.

### Branch Naming Convention
```bash
feature/disease-detection-improvement
feature/add-weather-widget
bugfix/login-validation-issue
docs/update-contributing-guide
hotfix/critical-security-patch
```

## 🎯 Making Your First Contribution

### Finding the Right Issue

Start with these labels:
- **`good first issue`**: Perfect for newcomers
- **`help wanted`**: More complex but still accessible
- **`documentation`**: Improve docs and guides
- **`bug`**: Fix existing issues
- **`enhancement`**: Add new features

Browse issues at: https://github.com/alumnx-ai-labs/agro-bot-frontend/issues

### Easy First Contributions

1. **Fix typos** in documentation
2. **Improve error messages** for better user experience
3. **Add comments** to existing code
4. **Update dependencies** to latest versions
5. **Write tests** for existing features
6. **Improve responsive design** on mobile

## 📝 Detailed Contribution Process

### Step 1: Fork the Repository

1. **Visit the repository**
   - Go to: https://github.com/alumnx-ai-labs/agro-bot-frontend

2. **Click Fork**
   - Click the "Fork" button in the top-right corner
   - Select your GitHub account as the destination
   - Wait for the fork to complete

3. **Verify your fork**
   - You should now have the repo at: `https://github.com/YOUR-USERNAME/agro-bot-frontend`

### Step 2: Clone Your Fork

1. **Clone to your computer**
   ```bash
   # Using HTTPS
   git clone https://github.com/YOUR-USERNAME/agro-bot-frontend.git
   
   # Or using SSH (if set up)
   git clone git@github.com:YOUR-USERNAME/agro-bot-frontend.git
   
   # Navigate to project
   cd agro-bot-frontend
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/alumnx-ai-labs/agro-bot-frontend.git
   
   # Verify remotes
   git remote -v
   ```

### Step 3: Set Up Development Environment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   The app should open at `http://localhost:3000`

4. **Verify everything works**
   - Check that the app loads without errors
   - Test basic functionality
   - Look at browser console for any warnings

### Step 4: Create a Feature Branch

1. **Update your local dev branch**
   ```bash
   git checkout dev
   git pull upstream dev
   ```

2. **Create new feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
   **Example names:**
   - `feature/improve-disease-detection`
   - `bugfix/fix-responsive-layout`
   - `docs/update-installation-guide`

### Step 5: Make Your Changes

1. **Plan your changes**
   - Read the issue description carefully
   - Ask questions in the issue comments if unclear
   - Break large features into smaller commits

2. **Code your solution**
   - Follow our [coding standards](#coding-standards)
   - Write clean, readable code
   - Add comments for complex logic
   - Test as you go

3. **Test thoroughly**
   ```bash
   # Run tests
   npm test
   
   # Run linting
   npm run lint
   
   # Check formatting
   npm run format:check
   ```

### Step 6: Commit Your Changes

1. **Stage your changes**
   ```bash
   # Stage specific files
   git add src/components/NewComponent.js
   git add src/styles/newstyles.css
   
   # Or stage all changes
   git add .
   ```

2. **Write a good commit message**
   ```bash
   git commit -m "feat: add weather forecast widget to dashboard
   
   - Add WeatherWidget component with 5-day forecast
   - Integrate OpenWeather API for real-time data
   - Add responsive design for mobile devices
   - Include loading states and error handling
   
   Closes #123"
   ```

### Step 7: Push and Create Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - **IMPORTANT**: Set base branch to `dev` (not main!)
   
3. **Fill out PR template**
   ```markdown
   ## Description
   Brief summary of what this PR does and why it's needed.

   ## Type of Change
   - [ ] Bug fix (non-breaking change which fixes an issue)
   - [ ] New feature (non-breaking change which adds functionality)
   - [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
   - [ ] Documentation update

   ## Changes Made
   - Detailed list of changes
   - Use bullet points
   - Be specific about what was modified

   ## Testing
   - [ ] I have tested this change locally
   - [ ] I have added tests that prove my fix is effective or that my feature works
   - [ ] New and existing unit tests pass locally with my changes

   ## Screenshots (if applicable)
   Add screenshots to help explain your changes

   ## Related Issues
   - Closes #123
   - Related to #456

   ## Checklist
   - [ ] My code follows the project's style guidelines
   - [ ] I have performed a self-review of my own code
   - [ ] I have commented my code, particularly in hard-to-understand areas
   - [ ] I have made corresponding changes to the documentation
   - [ ] My changes generate no new warnings
   ```

## 📏 Guidelines and Standards

### Coding Standards

#### JavaScript/React
```javascript
// ✅ Good
const WeatherWidget = ({ location, onError }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clear, descriptive function names
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getWeather(location);
      setWeatherData(data);
    } catch (error) {
      onError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-widget">
      {/* Component JSX */}
    </div>
  );
};

// ❌ Avoid
const w = (props) => {
  const [d, setD] = useState(null);
  // Unclear variable names and missing error handling
};
```

#### CSS/Styling
```css
/* ✅ Good - Use BEM methodology */
.weather-widget {
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--bg-primary);
}

.weather-widget__header {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.weather-widget__temperature {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
}

/* ❌ Avoid - Generic class names */
.widget { /* too generic */ }
.big { /* not descriptive */ }
```

### Git Commit Guidelines

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic changes)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples
```bash
feat(disease-detection): add support for wheat diseases

- Add wheat disease recognition model
- Update disease database with wheat-specific entries
- Add wheat disease treatment recommendations

Closes #234

fix(mobile): resolve layout issues on small screens

- Fix responsive grid on devices < 768px
- Adjust font sizes for better readability
- Fix button spacing in mobile navigation

Closes #456

docs(api): update authentication documentation

- Add examples for JWT token usage
- Document new OAuth2 endpoints
- Fix typos in existing API docs
```

### Code Review Guidelines

#### For Contributors
- **Self-review first**: Review your own code before submitting
- **Keep PRs small**: Easier to review and less likely to have issues
- **Write good descriptions**: Help reviewers understand your changes
- **Be responsive**: Reply to feedback promptly and professionally
- **Don't take it personally**: Code review is about the code, not you

#### For Reviewers
- **Be constructive**: Suggest improvements, don't just point out problems
- **Explain the why**: Help contributors learn and improve
- **Be timely**: Review PRs within a reasonable time frame
- **Approve readily**: If code is good enough, approve it
- **Focus on important issues**: Don't nitpick minor style issues

### Testing Standards

#### Unit Tests
```javascript
// ✅ Good test structure
describe('WeatherWidget', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should display loading state while fetching weather', async () => {
    render(<WeatherWidget location="Delhi" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display weather data when fetch succeeds', async () => {
    const mockWeatherData = {
      temperature: 25,
      condition: 'Sunny',
      humidity: 60
    };
    
    weatherService.getWeather.mockResolvedValueOnce(mockWeatherData);
    
    render(<WeatherWidget location="Delhi" />);
    
    await waitFor(() => {
      expect(screen.getByText('25°C')).toBeInTheDocument();
      expect(screen.getByText('Sunny')).toBeInTheDocument();
    });
  });
});
```

#### Integration Tests
```javascript
describe('Disease Detection Flow', () => {
  it('should complete full disease detection workflow', async () => {
    // Test complete user journey
    const user = userEvent.setup();
    
    render(<App />);
    
    // Navigate to disease detection
    await user.click(screen.getByText('Disease Detection'));
    
    // Upload image
    const fileInput = screen.getByLabelText(/upload image/i);
    const file = new File(['test'], 'crop.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);
    
    // Check results
    await waitFor(() => {
      expect(screen.getByText(/disease detected/i)).toBeInTheDocument();
    });
  });
});
```

## 🔍 Review Process

### What Happens After You Submit a PR?

1. **Automated Checks** (1-2 minutes)
   - CI/CD pipeline runs
   - Tests execute
   - Code quality checks
   - Build verification

2. **Initial Review** (1-3 days)
   - Maintainer does initial review
   - Checks if PR follows guidelines
   - Provides feedback or approves

3. **Iteration** (as needed)
   - Address reviewer feedback
   - Push new commits to same branch
   - Respond to comments

4. **Final Approval** (1-2 days)
   - All feedback addressed
   - All checks pass
   - PR approved by maintainer

5. **Merge to dev**
   - PR merged into dev branch
   - Feature deployed to staging
   - Included in next release

### Common Review Feedback

#### Code Issues
- **Missing error handling**: Add try-catch blocks
- **Performance concerns**: Optimize expensive operations
- **Security issues**: Sanitize inputs, validate data
- **Accessibility**: Add ARIA labels, keyboard navigation

#### Documentation Issues
- **Missing comments**: Explain complex logic
- **Outdated docs**: Update README or API docs
- **Missing tests**: Add unit or integration tests

#### Style Issues
- **Inconsistent formatting**: Run Prettier
- **Naming conventions**: Use descriptive names
- **File organization**: Follow project structure

### How to Handle Feedback

1. **Read carefully**: Understand what the reviewer is asking
2. **Ask questions**: If feedback is unclear, ask for clarification
3. **Make changes**: Address the feedback in new commits
4. **Respond to comments**: Let reviewers know what you've done
5. **Be patient**: Reviews take time, but they improve code quality

## 🎯 Advanced Contributions

### Working on Complex Features

1. **Create an issue first**: Discuss approach with maintainers
2. **Break into smaller PRs**: Easier to review and merge
3. **Keep dev updated**: Regularly sync with upstream dev branch
4. **Write comprehensive tests**: Cover edge cases and error scenarios
5. **Update documentation**: Include API docs, user guides, etc.

### Becoming a Regular Contributor

1. **Consistent quality**: Submit well-tested, documented code
2. **Help others**: Review PRs, answer questions, mentor newcomers
3. **Take ownership**: Become expert in specific areas of codebase
4. **Propose improvements**: Suggest architectural enhancements
5. **Community involvement**: Participate in discussions, planning

## 🤝 Community and Support

### Getting Help

#### Discord/Slack (if available)
- Real-time chat with other contributors
- Ask questions and get quick responses
- Share screenshots and debug together

#### GitHub Discussions
- Longer-form discussions about features
- Ask for help with complex issues
- Share ideas and get feedback

#### GitHub Issues
- Report bugs with detailed information
- Request new features
- Ask questions about existing features

### Communication Guidelines

#### Be Clear and Specific
```
❌ "It doesn't work"
✅ "Disease detection fails with 'Network Error' when uploading images larger than 5MB on Chrome 91"
```

#### Provide Context
```
❌ "How do I add a new component?"
✅ "I want to add a soil quality indicator component to the dashboard. Should it go in the existing dashboard layout or as a separate page? What APIs should I use for soil data?"
```

#### Be Patient and Respectful
- Remember maintainers are volunteers
- Other contributors have different experience levels
- Everyone is learning and improving together

### Code of Conduct Violations

If you experience or witness any violations:
1. **Document the incident**: Screenshots, links, timestamps
2. **Report privately**: Email maintainers directly
3. **Don't engage publicly**: Avoid escalating conflicts
4. **Trust the process**: Maintainers will investigate and act

## 🚀 Next Steps

### After Your First PR is Merged

1. **Celebrate!** 🎉 You're now an open-source contributor!
2. **Update your portfolio**: Add the contribution to your resume/LinkedIn
3. **Find your next issue**: Look for more ways to help
4. **Help others**: Answer questions from new contributors
5. **Share your experience**: Write about it, encourage others

### Growing as a Contributor

#### Technical Skills
- **Learn the codebase**: Understand architecture and patterns
- **Improve testing**: Write better tests, learn testing frameworks
- **Performance optimization**: Learn profiling and optimization
- **Security awareness**: Understand common vulnerabilities

#### Soft Skills
- **Communication**: Clear writing and constructive feedback
- **Collaboration**: Working effectively with distributed teams
- **Leadership**: Mentoring newcomers and driving initiatives
- **Project management**: Planning features and coordinating work

### Recognition and Opportunities

- **Contributor badge**: Display your open-source contributions
- **Maintainer invitation**: Become a project maintainer
- **Conference speaking**: Share your experience at meetups/conferences
- **Job opportunities**: Open-source contributions are valued by employers
- **Network building**: Connect with developers worldwide

## 📚 Additional Resources

### Learning Resources
- **Git/GitHub**: [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- **React**: [Official React Documentation](https://reactjs.org/docs/getting-started.html)
- **JavaScript**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **Testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Tools and Extensions
- **VS Code Extensions**: ES7 snippets, Prettier, ESLint, GitLens
- **Browser Extensions**: React Developer Tools, Redux DevTools
- **CLI Tools**: GitHub CLI, Netlify CLI, Heroku CLI

### Agricultural Domain Knowledge
- **Crop Diseases**: [FAO Plant Health](http://www.fao.org/plant-health/en/)
- **Precision Agriculture**: Research papers and industry reports
- **Indian Agriculture**: Government schemes and policies
- **Weather APIs**: OpenWeatherMap, AccuWeather documentation

## ❤️ Thank You!

Thank you for contributing to Krishi Vikas! Your efforts help:
- **Farmers worldwide** access better technology
- **Improve food security** through better crop yields
- **Advance sustainable agriculture** practices
- **Build a stronger open-source community**

Every contribution, no matter how small, makes a real difference. We're excited to see what you'll build with us!

---

**Happy Contributing!** 🌱💻

*If you have questions about this guide or need help getting started, please create an issue or reach out to the maintainers. We're here to help!*