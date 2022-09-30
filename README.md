# FCS September Milestone
### Group 15
1. Harshit Singh(2019424)
2. Sameer(2019330)
3. Arihant Singh(2019298)
4. Sudeep Reddy(2019313)

## Installing Nginx on VM
1. First we downloaded and installed updates for each outdated package and dependency on the VM using `sudo apt update`
2. Then we installed nginx using `sudo apt install nginx`
3. Since nginx is a webserver, we wanted to check if nginx is availabe on ubuntu-firewall (ufw); we used `sudo ufw app list`.![image](https://user-images.githubusercontent.com/54713483/193316767-882bb087-ad16-4ba3-b6e3-a0a1057bd3ea.png)!
## Setting up the Firewall
We wanted to setup firewal on our VM so that we can monitor incoming and outgoing network calls.
1. To allow for specific apps or port we used the cmd : `sudo ufw allow "port/app"` 
2. We allowed
    1. port 22
    2. Nginx HTTPS

![image](https://user-images.githubusercontent.com/54713483/193316956-db457153-6dcc-48c7-8e4a-28da83def9d1.png)

## Some basic commands to check on the web-server
1. `sudo systemctl status nginx` shows us the staus of our webserver ![image](https://user-images.githubusercontent.com/54713483/193316636-a833e402-b473-4613-a56b-1adefaa97506.png)
2. `sudo systemctl start nginx` starts the Nginx web-server
3. `sudo systemctl stop nginx` stops the Nginx web-server
4. `sudo systemctl restart nginx` restarts the Nginx web-server
## Creating the SSL Certificate
1. We wanted to change the permissions of the ssl-private key directory, to do this we used `sudo chmod 700 /etc/ssl/private`. chmod is called "change mode" and 700 means that the file is protected against any access from other users, while the issuing user still has full access. [Know more.](https://www.linuxtopia.org/online_books/introduction_to_linux/linux_The_chmod_command.html)
2. Next to create a self-signed key and certificate pair, we used `sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt`
      1. openssl: Command line tool for creating OpenSSL certificates, keys etc.
      2. req: This is a subcommand.specifies that we want to use X.509 certificate signing request (CSR) management. It follows the “X.509” certificate signing request which is a a public key standard that SSL and TLS follow to for its key and certificate management.
      3. -x509: This further telles the tool that we want a self-signed certificated instead of a request, whihc is the default behavior.
      4. -nodes: This tells OpenSSL to ignore a passphrase, since we are using this certificate with nginx it need to be able to read it without user intervantion.
      5. -days 365: the expiry length of the certificate, after 365 our certificate would be invalid.
      6. -newkey rsa:2048:This generates the key along with the certificate. The rsa:2048 implies an RSA key that is 2048 bits long.
      7. -keyout: Location to store the private file.
      8. -out: Location to store the certificate.
![image](https://user-images.githubusercontent.com/54713483/193317256-de3d2951-8d17-4ffe-8743-f5f73e94e259.png)
3. Next we created a Diffie-Hellman group, so that we can produce temporary private keys which can be exchanged between client and server. These are unique for every session, this will prevent any Logjam attack. SIn eth edefault key size in OpenSSL is 1024 bits, it is prone to logjam attacks since there can systems wihcih use DH key exchange with the same  prime number.  We used: `sudo openssl dhparam -out /etc/nginx/dhparam.pem 4096` ![image](https://user-images.githubusercontent.com/54713483/193317556-011b6ca2-ec7b-497d-8eef-c5a99f1b5ec6.png)

## Editing Nginx config to use SSL
1. We added the following lines to the file called `ssl.conf` in `/etc/nginx/conf.d`
```
server {
    listen 80;
    listen [::]:80;
    server_name 192.168.2.247;
    return 301 https://$host$request_uri;
    # This server config redirects all http request to https
    # The default http port in nginx is port 80
}
server {
    listen 443 http2 ssl;
    listen [::]:443 http2 ssl;
    

    server_name 192.168.2.247;

    # SSL configuration
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    # Using custom  Diffie-Hellman key which was generated 
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    root /usr/share/nginx/html;

    location / {
    }

    error_page 404 /404.html;
    location = /404.html {
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
    }
}
```
2. Save the file, and restart nginx using `sudo systemctl restart nginx`
3. Go to https://192.168.2.247/ or http://192.168.2.247/ ![image](https://user-images.githubusercontent.com/54713483/193317637-4f78e28f-7ae3-45a4-b236-c4f46b2c944d.png)![image](https://user-images.githubusercontent.com/54713483/193317673-ba705181-c164-4e67-821c-5e9ca6ae325b.png)
![image](https://user-images.githubusercontent.com/54713483/193317710-b0d87bd0-92ea-4770-8330-3e761e5d91c8.png)



## Tech Stack 
1. Frontend
    1. React
    2. SCSS
2. Backend
    1. Django
3. Database: PostgreSQL
4. Webserver: Nginx
  

