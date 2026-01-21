# Git Collaboration Guide for GroupSync Team

## Table of Contents
1. [Repository Structure](#repository-structure)
2. [Branch Strategy](#branch-strategy)
3. [Daily Workflow](#daily-workflow)
4. [Getting Others' Work](#getting-others-work)
5. [Common Scenarios](#common-scenarios)
6. [Merge Conflicts](#merge-conflicts)
7. [Best Practices](#best-practices)

---

## Repository Structure

```
main (protected - only deploy-ready code)
  ↑
develop (integration branch - all features merge here first)
  ↑
  ├── feature/auth (Eli - Team A)
  ├── feature/groups (Emiliano - Team B)
  ├── feature/tasks (Fabrice - Team C)
  ├── feature/meetings (Ariana - Team D)
  └── feature/messaging (Connor - Team E)
```

### Branch Purposes

- **`main`**: Production-ready code only. Protected branch (no direct pushes).
- **`develop`**: Integration branch where all features come together. Test here before merging to `main`.
- **`feature/*`**: Individual feature branches where you do your work.

---

## Branch Strategy

### Protected Branches
- **`main`** is protected — requires pull request + review to merge
- **`develop`** is semi-protected — can merge directly but PRs recommended

### Feature Branches
Each team member works on their own feature branch:
- Eli: `feature/auth`
- Emiliano: `feature/groups`
- Fabrice: `feature/tasks`
- Ariana: `feature/meetings`
- Connor: `feature/messaging`

---

## Daily Workflow

### Starting Your Day

```bash
# 1. Switch to your feature branch
git checkout feature/auth  # (use your branch name)

# 2. Pull latest changes from develop
git pull origin develop

# 3. Merge develop into your feature branch
git merge develop

# 4. Resolve any conflicts (if they exist)
# 5. Start coding!
```

### During Your Work

```bash
# Save your work frequently
git add .
git commit -m "Add user profile endpoint"

# Push to your feature branch
git push origin feature/auth
```

### End of Your Day

```bash
# Commit and push any remaining work
git add .
git commit -m "WIP: Working on profile tests"
git push origin feature/auth
```

---

## Getting Others' Work

### Scenario 1: You Need Someone's Feature

**Example: Fabrice needs Eli's auth to test task permissions**

```bash
# 1. Make sure your work is committed
git add .
git commit -m "Save current work"

# 2. Switch to develop branch
git checkout develop

# 3. Pull latest develop
git pull origin develop

# 4. Switch back to your feature branch
git checkout feature/tasks

# 5. Merge develop (which has Eli's auth)
git merge develop

# 6. Resolve conflicts if any
# 7. Test with Eli's auth features
```

### Scenario 2: Everyone Needs to Share Progress

**Every Friday or when a feature is complete:**

```bash
# 1. Commit your work
git add .
git commit -m "Complete user profile endpoint"

# 2. Switch to develop
git checkout develop

# 3. Pull latest develop
git pull origin develop

# 4. Merge your feature into develop
git merge feature/auth

# 5. Push to develop
git push origin develop

# 6. Notify team in Discord/Slack
```

Now everyone can get your work by pulling `develop`!

---

## Common Scenarios

### Scenario A: Starting a New Feature

```bash
# Make sure you're on develop
git checkout develop
git pull origin develop

# Create new feature branch
git checkout -b feature/auth

# Start coding
# ... make changes ...

# Commit and push
git add .
git commit -m "Add user registration endpoint"
git push origin feature/auth
```

### Scenario B: Merging Your Feature to Develop

**When your feature is complete and tested:**

```bash
# 1. Make sure your feature is up to date with develop
git checkout feature/auth
git pull origin develop
git merge develop

# 2. Test everything still works
# Run tests: python manage.py test

# 3. Switch to develop
git checkout develop
git pull origin develop

# 4. Merge your feature
git merge feature/auth

# 5. Push to develop
git push origin develop

# 6. Announce to team
```

### Scenario C: Getting Latest Code from Team

**Every morning or when someone announces they pushed to develop:**

```bash
# Save your current work first
git add .
git commit -m "WIP: Save progress"

# Pull latest develop
git checkout develop
git pull origin develop

# Merge into your feature branch
git checkout feature/auth
git merge develop

# Continue working
```

### Scenario D: Creating a Pull Request (PR)

**When you want code review before merging:**

```bash
# 1. Push your feature branch
git push origin feature/auth

# 2. Go to GitHub repo in browser
# 3. Click "Pull requests" → "New pull request"
# 4. Set: base: develop ← compare: feature/auth
# 5. Add description of changes
# 6. Click "Create pull request"
# 7. Tag teammate to review
# 8. Wait for approval, then merge
```

---

## Merge Conflicts

### What Are Merge Conflicts?

When two people edit the same file in different ways, Git doesn't know which version to keep.

### How to Resolve

```bash
# When you see conflict during merge:
git merge develop
# Auto-merging users/views.py
# CONFLICT (content): Merge conflict in users/views.py

# 1. Open the conflicted file
code users/views.py

# 2. Look for conflict markers:
<<<<<<< HEAD
# Your code
def my_function():
    return "my version"
=======
# Their code
def my_function():
    return "their version"
>>>>>>> develop

# 3. Edit to keep what you want:
def my_function():
    return "combined version"

# 4. Remove conflict markers (<<<, ===, >>>)

# 5. Save file, then:
git add users/views.py
git commit -m "Resolve merge conflict in views.py"
git push origin feature/auth
```

---

## Best Practices

### DO ✅

1. **Commit often** — Small, frequent commits are easier to manage
2. **Write clear commit messages** — "Add user login endpoint" not "updates"
3. **Pull before you push** — Always `git pull` before `git push`
4. **Test before merging to develop** — Run `python manage.py test`
5. **Communicate** — Tell team when you merge to develop
6. **Use feature branches** — Never work directly on `main` or `develop`
7. **Review others' code** — Help catch bugs early

### DON'T ❌

1. **Don't force push** — `git push -f` can delete others' work
2. **Don't commit secrets** — Never commit passwords, API keys, tokens
3. **Don't merge broken code** — Test first!
4. **Don't work on `main`** — Always use feature branches
5. **Don't ignore conflicts** — Resolve them properly
6. **Don't commit large files** — Use `.gitignore` for databases, logs, etc.

---

## Weekly Integration Schedule

### Monday
- Pull latest `develop`
- Merge into your feature branch
- Start week's work

### Wednesday (Mid-week sync)
- If you have working features, merge to `develop`
- Test integration with others' code
- Fix any issues

### Friday (End of week)
- Merge completed features to `develop`
- Team testing session
- Update project board

---

## Git Commands Cheat Sheet

```bash
# Check which branch you're on
git branch

# Switch branches
git checkout feature/auth

# Create new branch
git checkout -b feature/new-feature

# See what changed
git status

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes (DANGEROUS!)
git reset --hard HEAD

# See differences
git diff

# Pull specific branch
git pull origin develop

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

---

## Getting Help

### If You're Stuck:
1. **Ask in team chat** — Someone has probably solved this before
2. **Check Git status** — `git status` shows what's happening
3. **Google the error** — Most Git errors have Stack Overflow answers
4. **Ask Eli or Connor** — They're most experienced with Git

### Emergency Commands

```bash
# Undo everything and start fresh (CAREFUL!)
git stash  # Save your work temporarily
git checkout develop
git pull origin develop
git checkout feature/auth
git reset --hard origin/feature/auth
git stash pop  # Get your work back
```

---

## Example: Full Week Workflow

**Monday Morning (Eli - Team A)**
```bash
git checkout feature/auth
git pull origin develop
git merge develop
# Start working on user profile endpoint
```

**Tuesday Afternoon**
```bash
git add users/views.py users/serializers.py
git commit -m "Add user profile GET endpoint"
git push origin feature/auth
```

**Wednesday (Feature complete)**
```bash
# Test everything
python manage.py test

# Merge to develop
git checkout develop
git pull origin develop
git merge feature/auth
git push origin develop

# Announce in Discord: "Auth profile endpoint merged to develop!"
```

**Thursday (Fabrice needs auth)**
```bash
# Fabrice pulls Eli's work
git checkout feature/tasks
git pull origin develop
git merge develop

# Now Fabrice can test tasks with auth!
```

---

## Questions?

- **Q: When should I merge to develop?**
  - A: When a feature is complete and tested. Not for every small change.

- **Q: How often should I pull from develop?**
  - A: Daily, or whenever someone announces they merged.

- **Q: What if I accidentally committed to develop?**
  - A: Create a new feature branch from that commit, reset develop to origin.

- **Q: Can I work on multiple features at once?**
  - A: Create separate branches for each feature.

- **Q: What if I mess up really badly?**
  - A: Ask for help! We can always recover using Git history.

---

**Remember:** Git is a tool to help collaboration. Don't be afraid to experiment in your feature branch—you can always reset or ask for help! 🚀
