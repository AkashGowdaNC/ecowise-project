# Quick Start Guide

Follow these steps to get EcoWise running on your local machine.

## Prerequisites
- Python 3.8 or higher
- Node.js (optional, for advanced frontend dev)
- A modern web browser

## Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AkashGowdaNC/ecowise-project.git
    cd ecowise-project
    ```

2.  **Backend Setup**
    Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    The frontend is a static web application. You can serve it using a simple HTTP server or open `frontend/index.html` directly in your browser (though some features like camera access may require a secure context or localhost).

    To serve with Python:
    ```bash
    # From the project root
    python -m http.server 8000
    ```

## Running the Application

1.  Start the backend server:
    ```bash
    cd backend
    python app.py
    ```

2.  Open your browser and navigate to `http://localhost:8000/frontend/index.html` (if using Python's http.server) or the appropriate URL for your setup.

## troubleshooting
- If camera access fails, ensure you are using `localhost` or `https`.
- If the AI model fails to load, check the backend console for error messages regarding missing weights or libraries.
