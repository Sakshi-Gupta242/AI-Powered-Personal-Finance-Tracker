import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app

app = create_app()

# WSGI Middleware to ensure PATH_INFO works reliably in both /api/... and /... setups
class VercelPathMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path_info = environ.get('PATH_INFO', '')
        # Ensure path_info starts with /api if it doesn't already, since all app routes expect /api prefix
        if not path_info.startswith('/api'):
            environ['PATH_INFO'] = '/api' + (path_info if path_info.startswith('/') else '/' + path_info)
        return self.wsgi_app(environ, start_response)

app.wsgi_app = VercelPathMiddleware(app.wsgi_app)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
