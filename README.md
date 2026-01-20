# WebCV Engine

This is the engine for generating a static HTML CV from a YAML file. It is designed to be installed as a dependency in your private CV data repository.

## Usage in a Private Repository

1.  **Create a new private repository** for your personal data.
2.  **Initialize npm** and install this tool:
    ```bash
    npm init -y
    # Replace 'user/repo' with the path to this engine repo
    # e.g. npm install github:myusername/webcv
    npm install github:your-username/webcv-engine
    ```
3.  **Initialize the project**:

    ```bash
    npx webcv init
    ```

    This will:
    - Create a `resume.yaml` and `config.yaml` template.
    - Give you instructions on how to finish the setup.

4.  **Edit `resume.yaml`** with your details.
5.  **Enable GitHub Pages**:
    - Go to repo Settings > Pages.
    - Under "Build and deployment", select **GitHub Actions** as the source.
6.  **Push**: Your CV will be live at `https://your-username.github.io/my-cv-repo/`.

## Example `resume.yaml` Structure

```yaml
basics:
  name: "Jane Doe"
  label: "Software Engineer"
  summary: "Passionate developer..."
  contact:
    email: "jane@example.com"
    github: "janedoe"
experience:
  - company: "Tech Corp"
    role: "Senior Dev"
    years: "2020 - Present"
    description: "Building cool things."
education:
  - school: "University of Code"
    degree: "BS Computer Science"
    year: "2019"
skills:
  - "JavaScript"
  - "Node.js"
```
