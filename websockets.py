import socket

def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    host = socket.gethostname()
    port = 9999
    
    server_socket.bind((host, port))
    server_socket.listen(5)
    
    while True:
        client_socket, addr = server_socket.accept()
        print(f"Got a connection from {addr}")
        
        # Define the HTML content
        html_content = """
        <html>
        <head><title>My Web App</title></head>
        <body>
            <h1>Welcome to My Web App</h1>
            <p>This is a simple web app served by Python sockets.</p>
        </body>
        </html>
        """
        
        # Send HTTP response
        response = 'HTTP/1.1 200 OK\nContent-Type: text/html\n\n' + html_content
        client_socket.send(response.encode('ascii'))
        
        client_socket.close()

if __name__ == '__main__':
    start_server()