# 🚀 **DevOps Project: Deployed a Application in ArgoCD using AWS, Deployed in Private network.**

## **Fontend is in React and Backend in PHP-Laravel**

## **Deploying Frontend in one pod, Backend in another pod and Database is in RDS. Database and pods are on same VPC (Custom VPC)**

In this production-level DevOps project, developers push code that flows through an approval-driven promotion pipeline—from the initial testing branch, where the testing team reviews and authorizes the changes, to the pre-production (preprod) branch, pending the preprod team's sign-off, and finally into the main branch after main team approval. Once merged into main, Jenkins automatically builds the code, runs static code analysis via SonarQube, performs file-level vulnerability scanning with Trivy, builds a Docker image for frontend and backend that it again scans with Trivy, then pushes the secured image to Docker Hub. Pull the image from dockerhub and Created the frontend and backend application in different pods.

In this setup, the application code is not directly exposed on the server. The project follows a two-repositories: one repository for application source code and another for GitOps manifests. Docker images are built in Jenkins pipelines, and the image tags are automatically updated in the GitOps repository.


## **Manifest Repository**

[GitOps Repository](https://github.com/didin8080/laravel-react-manifest.git)

## **Phase 1: Create a Custom VPC**

**Step 1: Create VPC only** 


**Step 2: Create 4 Subnet 2 Public and 2 Private subnet. Name for 2 Public subnet  pubic-subnet-1a, pubic-subnet-1b and 2 private subnet  private-subnet-1a, private-subnet-1b**

**Step 3: Create Internet Gateway and Attach to VPC**

**Step 4: Create NAT Gateway and attach Elastic IP**

**Step 5: Create 2 Route tables one for RT Public and another is RT Private**

    - On Public Route table --> Routes --> Destination 0.0.0.0/0 --> Target Internet Gateway
    - On Public Route table --> Subnet Association --> Add all Public subnet 

    - On Private Route table --> Routes --> Destination 0.0.0.0/0 --> Target NAT Gateway
    - On Private Route table --> Subnet Association -->  Add all Private subnet 


## **Phase 2: Configure Jenkins and Sonarqube in public subnet**


**Step 1: Create EC2 instance for Jenkins and Sonarqube**

- Provision an EC2 instance on AWS with Ubuntu 22.04,volume 29gb,t3.large. 
- Connect to the instance using SSH.
- Allow ports
  - Custom TCP 8080
  - Custom TCP 9000
  - SSH 22


**Step 2: Install jenkins on ubuntu**

```bash
sudo apt update
sudo apt install fontconfig openjdk-21-jre
java -version

sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins

sudo systemctl enable jenkins

sudo systemctl start jenkins
```

**Step 3: Install Docker on ubuntu**

```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update

sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
sudo chmod 666 /var/run/docker.sock
```

**Step 4: Install sonarqube on ubuntu**

```bash
docker run -d --name sonar -p 9000:9000 sonarqube:latest
```

**Step 5: Install necessary plugins on jenkins**

- Eclipse Temurin installer
- Pipeline: Stage View 
- SonarQube Scanner
- Docker 
- Docker Commons 
- Docker Pipeline Version 
- Docker API
- docker-build-step
- Git Pipeline for Blue Ocean
- P4
- Gitea
- Git Push 
- Poll SCM 
- SCM Sync Configuration 
- Gradle Repo
- SCM Skip
- SCM to job
- SCM-Manager Version 
- Pipeline SCM API for Blue Ocean Version 

From `Git Pipeline for Blue Ocean` to  `Pipeline SCM API for Blue Ocean Version` are used to automate the pipeline .If developer push the code the jenkins pipeline automatically runs.

Add webhook on github.

**Step 6: Tools configuration in jenkins**

Goto Jenkins dashboard--> Manage Jenkins --> tools 
- add jdk,give name as jdk17 ,install automatically ,add installer, install from adoptium.net, select jdk-17.0.8.1+1 
- add sonarqube scanner--> name= sonar-scaner,insall automatically,
- add docker --> name=docker,install automatically,add installer ,download from docker.com
- add nodejs --> name=node25
- apply and save

**Step 7: Create token on Docker**

Goto dockerhub --> goto profile --> Account settings --> Personal access token --> Generate new token --> give any name --> Access permission = read and write.


**Step 8: ADD Credentials on Jenkins**

- On sonarqube -> admininstration-->security--> user--> rightside 3dots--> give any name --> generate token

- On jenkins --> manage jenkins-->credentials-->global--> add credentials--> kind=secret text --> on secret paste the sonarqube token and give any name and description-->give sonar-token and description-->create

- On jenkins --> manage jenkins-->credentials-->global--> add credentials--> kind=username with password --> username= username of dockerhub -->password= the token that we created from dockerhub. --> id= docker

- On jenkins --> manage jenkins-->credentials-->global--> add credentials--> kind=username with password--> username= provide your mail id -->password= the APP PASSWORD that you created --> id= smtp.

- On jenkins --> manage jenkins-->credentials-->global--> add credentials--> kind=username with password--> username= github username where gitops manifests is there  -->password= token of github --> id= git-cred.

**Step 9: System Configuration on Jenkins**

On jenkins--> manage jenkins--> system

- add sonarqube server -->give name as sonar-server--> on server url= paste the url of sonarqube -->select the authentication --> apply and save .

- Extended email notification --> On SMTP server= smtp.gmail.com --> SMTP port = 465 -->advanced --> enale use SSL --> on credentails = add credentials that we added for gmail

- E-mail Notification --> On SMTP server = smtp.gmail.com --> advanced --> enable use ssl --> smtp port 465--> enable use SMTP authentication --> username= your-email-id --> on password = app password `eg:(drsn anne afrd pcfx)`--> enable test configuration by sending email --> enter our email--> test configuration --> Goto your email you will get an test email from jenkins --> apply and save


**Step 10: Create webhook in sonarqube**

- on jenkins--> manage jenkins--> system--> add sonarqube server -->give name as sonar-server--> on server url= paste the url of sonarqube with sonarqube-webhook eg:**(192.168.20.173:8080/sonarqube-webhook)** -->select the authentication --> apply and save .

**Step 11: Configure CI/CD pipeline in jenkins**

Before pasting the pipeline script, do the following changes in the script
1. In the stage 'Tag and Push to DockerHub', give your docker-hub username.
2. In post actions stage in pipeline, make sure to give the email id you have configured in jenkins.
3. Replace the checkout repo and generate the link using Pipeline Syntax
4. while generating the github link will be in private.To get the link add credentials on the link 
5. REplace the ip of docker instance on docker stage and docker image replace the entire think.

```groovy
pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node25'
    }
    environment{
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_REGISTRY = 'didin8080'
        IMAGE_FRONT_NAME = "frontend"
        IMAGE_FULL_FRONT_NAME = "didin8080/frontend"
        IMAGE_BACK_NAME = "backend"
        IMAGE_FULL_BACK_NAME = "didin8080/backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        GITOPS_REPO = "https://github.com/didin2003/laravel-kubernetes.git"
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout from GitHub') {
            steps {
                git branch: 'main', url: 'https://github.com/didin2003/laravel-react.git'
                script {
                    def hash = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    def timestamp = new Date().format('yyyyMMddHHmmss')
                    env.COMMIT_HASH = hash
                    env.IMAGE_VERSION = "${hash}-${timestamp}"
                    env.ZIP_NAME = sh(script: "date +%F", returnStdout: true).trim()
                    env.ZIP_TIME = sh(script: "TZ=Asia/Kolkata date +%F-%H%M%S", returnStdout: true).trim()
                }
            }
       }
        stage('Sonarqube Analysis') {
            steps {
               withSonarQubeEnv('sonar-server') {
                   sh """
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=argocd \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://34.201.12.0:9000 \
                       """
                }
            }
        }
        stage('Code Quality gate') {
            steps {
                waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token' 
            }
        }
        stage('Trivy Filesystem Scan for frontend') {
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                        def template = fileExists('html.tpl') ? '@html.tpl' : 'table'
                        sh """
                            mkdir -p ${TRIVY_CACHE_DIR}
                            trivy fs --scanners vuln,misconfig --cache-dir ${TRIVY_CACHE_DIR} \
                                --format template --template ${template} -o trivy-fs-report.html . || echo "Trivy FS scan completed with findings"
                        """
                        archiveArtifacts artifacts: 'trivy-fs-report.html'
                        def fsReport = readFile('trivy-fs-report.html')
                        env.FS_SCAN_CRITICAL = fsReport.contains('CRITICAL') ? 'Yes' : 'No'
                        if (env.FS_SCAN_CRITICAL == 'Yes') {
                            error("Critical vulnerabilities found in filesystem scan")
                        }
                    }
                }
            }
        }
        stage('Build docker image for frontend') {
            steps {
                sh """
                    cd react-frontend
                    git pull origin main
                    docker system prune -a -f
                    docker build -t ${IMAGE_FULL_FRONT_NAME}:${IMAGE_VERSION} .
                    docker tag ${IMAGE_FULL_FRONT_NAME}:${IMAGE_VERSION} ${IMAGE_FULL_FRONT_NAME}:${IMAGE_TAG}
                    """
            }
        }
        stage('Push to dockerhub for frontend') {
            steps {
                withDockerRegistry([credentialsId: 'docker', url: 'https://index.docker.io/v1/']) {
                    sh """
                        docker push ${IMAGE_FULL_FRONT_NAME}:${IMAGE_VERSION} || true
                        docker push ${IMAGE_FULL_FRONT_NAME}:${IMAGE_TAG}
                      """
                }
            }
        }
        stage('Trivy Filesystem Scan for backend') {
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                        def template = fileExists('html.tpl') ? '@html.tpl' : 'table'
                        sh """
                            mkdir -p ${TRIVY_CACHE_DIR}
                            trivy fs --scanners vuln,misconfig --cache-dir ${TRIVY_CACHE_DIR} \
                                --format template --template ${template} -o trivy-fs-report.html . || echo "Trivy FS scan completed with findings"
                        """
                        archiveArtifacts artifacts: 'trivy-fs-report.html'
                        def fsReport = readFile('trivy-fs-report.html')
                        env.FS_SCAN_CRITICAL = fsReport.contains('CRITICAL') ? 'Yes' : 'No'
                        if (env.FS_SCAN_CRITICAL == 'Yes') {
                            error("Critical vulnerabilities found in filesystem scan")
                        }
                    }
                }
            }
        }
        stage('Build docker image for backend') {
            steps {
                sh """
                    cd laravel-backend
                    git pull origin main
                    docker system prune -a -f
                    docker build -t ${IMAGE_FULL_BACK_NAME}:${IMAGE_VERSION} .
                    docker tag ${IMAGE_FULL_BACK_NAME}:${IMAGE_VERSION} ${IMAGE_FULL_BACK_NAME}:${IMAGE_TAG}
                    """
            }
        }
        stage('Push to dockerhub for backend') {
            steps {
                withDockerRegistry([credentialsId: 'docker', url: 'https://index.docker.io/v1/']) {
                    sh """
                         docker push ${IMAGE_FULL_BACK_NAME}:${IMAGE_VERSION} || true
                         docker push ${IMAGE_FULL_BACK_NAME}:${IMAGE_TAG}
                       """
                }
            }
        }
        stage('Update gitops repo for frontend') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'git-cred', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
                    sh """
                        rm -rf laravel-kubernetes
                        git clone https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/didin2003/laravel-kubernetes.git
                        cd laravel-kubernetes/frontend

                        sed -i 's|image: ${DOCKER_REGISTRY}/${IMAGE_FRONT_NAME}:.*|image: ${DOCKER_REGISTRY}/${IMAGE_FRONT_NAME}:${IMAGE_TAG}|' deployment.yaml

                        git config user.email "didinpg8080@gmail.com"
                        git config user.name "Didin PG"
                        git add deployment.yaml
                        git commit -m "ci: update frontend image to ${IMAGE_TAG}"
                        git push origin main
                  """
            }
        }
    }
    stage('Update gitops repo for backend') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'git-cred', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
                    sh """
                        rm -rf laravel-kubernetes
                        git clone https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/didin2003/laravel-kubernetes.git 
                        cd laravel-kubernetes/backend

                        sed -i 's|image: ${DOCKER_REGISTRY}/${IMAGE_BACK_NAME}:.*|image: ${DOCKER_REGISTRY}/${IMAGE_BACK_NAME}:${IMAGE_TAG}|' deployment.yaml

                        git config user.email "didinpg8080@gmail.com"
                        git config user.name "Didin PG"
                        git add deployment.yaml
                        git commit -m "ci: update backend image to ${IMAGE_TAG}"
                        git push origin main
                  """
                }
            }
        }
    }
    post {
    always {
        emailext attachLog: true,
            subject: "'${currentBuild.result}'",
            body: """
                <html>
                <body>
                    <div style="background-color: #FFA07A; padding: 10px; margin-bottom: 10px;">
                        <p style="color: white; font-weight: bold;">Project: ${env.JOB_NAME}</p>
                    </div>
                    <div style="background-color: #90EE90; padding: 10px; margin-bottom: 10px;">
                        <p style="color: white; font-weight: bold;">Build Number: ${env.BUILD_NUMBER}</p>
                    </div>
                    <div style="background-color: #87CEEB; padding: 10px; margin-bottom: 10px;">
                        <p style="color: white; font-weight: bold;">URL: ${env.BUILD_URL}</p>
                    </div>
                </body>
                </html>
            """,
            to: 'didinpg8080@gmail.com',
            mimeType: 'text/html',
            attachmentsPattern: 'trivy.txt'
        }
    }
}
```


### Build it

If it get success, The docker image had build and the updated image name had commited to gitops manifests

## **Phase 3: Configure argocd in public subnet**

**Step 1: Create EC2 instance for ArgoCD**

- Provision an EC2 instance on AWS with Ubuntu 22.04,volume 29gb,t3.medium. 
- Connect to the instance using SSH.
- Allow ports
  - HTTP 80
  - HTTPS 443
  - SSH 22

**Step 2: Install awscli**

```bash
sudo apt install unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

**Step 3: Install kubectl**

```bash
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin
kubectl version --short --client
```

**Step 4: Install eksctl**

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version
```

**Step 5: Install helm**

```bash
sudo snap install helm --classic
```

**Step 6: Configure AWS**

```bash
aws configure
```
enter the Access key and Secret key

**Step 7: Create Cluster and Node Group**

```bash
eksctl create cluster \
  --name sonu-cluster \
  --version 1.29 \
  --region us-east-1 \
  --vpc-private-subnets=<private-subnet-ids> \
  --vpc-public-subnets=<public-subnet-ids> \
  --nodegroup-name node2 \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```
example 

```bash
--vpc-private-subnets=subnet-0aaa11bbb22ccc33,subnet-0ddd44eee55fff66 \

--vpc-public-subnets=subnet-0aaa111bbb222ccc,subnet-0ddd444eee555fff \ 
```

**Step 8: Create IAM for cluster**

```bash
eksctl utils associate-iam-oidc-provider --region us-east-1 --cluster didin-cluster --approve
```

```bash
kubectl get nodes
```

**Step 9: Install Traefik**

```bash
kubectl create namespace traefik

helm repo add traefik https://helm.traefik.io/traefik
helm repo update

helm install traefik traefik/traefik \
--namespace traefik \
--set service.type=LoadBalancer
```

Get LoadBalancer link

```bash
kubectl get svc -n traefik
```

Save EXTERNAL-IP → needed for DNS

**Step 10: Install ArgoCD**

```bash
kubectl create namespace argocd

kubectl apply -n argocd \
-f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

**Step 11: Create Ingress file for ArgoCD UI**

```bash
nano argocd-ingress.yaml
```

```bash
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-ingress
  namespace: argocd
spec:
  ingressClassName: traefik
  rules:
    - host: argocd.didin.in
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 80
```

Apply it 

```bash
kubectl apply -f argocd-ingress.yaml
```

Already saved ALB connect to domain

Create records:
```bash
Name	                    Type	        Value
<UI domain name>	       CNAME	    Traefik LB IP
<Frontend domain name>	   CNAME	    Traefik LB IP
<Backend domain name>	   CNAME	    Traefik LB IP
```

**Step 12: Login to Argocd**

```bash
kubectl get secret argocd-initial-admin-secret \
-n argocd \
-o jsonpath="{.data.password}" | base64 -d
```

It will generate a password eg: EXb3....

username: admin 

**Step 13: If an error occured while accessing ArgoCD Edit the file**

```bash
kubectl edit deployment argocd-server -n argocd
```

Find:

```bash
args:
  - /usr/local/bin/argocd-server
  - --secure
```

Remove it OR replace with:

```bash
args:
  - /usr/local/bin/argocd-server
  - --insecure
```

Restart ArgoCD server

```bash
kubectl rollout restart deployment argocd-server -n argocd
```

**Step 14: Create namespace for application**

```bash
kubectl create namespace apps
```

**Step 15: Create Secret for dockerhub to pull image**

```bash
kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=<username> --docker-password=<pass> -n apps
```

**Step 16: Create a Relational Database Service on Custom VPC**

**Step 17: Create Secret for .env for backend application**

Create .env.production file and add all the Credentials like db name, password, host etc etc 


```bash
kubectl create secret generic backend-env   --from-env-file=.env.production -n apps
```

**Step 18: Clone the repository of gitops manifests**

```bash
git clone https://github.com/didin2003/laravel-react.git
```

**Step 19: Deploy the application**

```bash
cd laravel-kubernetes
kubectl apply -f argocd/backend-app.yaml
kubectl apply -f argocd/frontend-app.yaml
kubectl apply -f ingress/ingress.yaml
```

**Step 20: Generate the app key and seed the data to database**

```bash
php artisan key:generate

php artisan migrate:fresh --seed
```

**Step 21:Copy the Generated key and paste it in .env file and recretate the Secret**

```bash
php artisan key:generate --show
```

it will display the key copy it and paste it in the .env file

```bash
kubectl delete secret backend-env -n apps

sudo nano .env.production

(Paste the key in APP_KEY=)
```

Create the secret and restart the pod

```bash
kubectl create secret generic backend-env   --from-env-file=.env.production -n apps

kubectl rollout restart deployment laravel-backend -n apps 
```

**Step 22: Verify the application**

Go to ArgoCD UI check the application status is Healthy and synced

<div align="center">
<img src="img/3-tier-login.png" alt="Logo" height="500%" width="100%">
<p align="center"> Login Page </p>
</div>

<div align="center">
<img src="img/3-tier-front1.png" alt="Logo" height="500%" width="100%">
<p align="center"> Dashboard 1</p>
</div>