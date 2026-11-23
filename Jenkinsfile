pipeline {
    agent { label 'rootless-docker' }

    triggers {
        pollSCM('H/5 * * * *')
    }

    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Get AgriPulse from GitHub') {
            steps {
                checkout scm
            }
        }

        stage('Test backend') {
            steps {
                sh '''
                  docker run --rm -v "$PWD/backend":/app -w /app node:22-alpine \
                    sh -c "npm ci && npm test --if-present"
                '''
            }
        }

        stage('Test frontend') {
            steps {
                sh '''
                  docker run --rm -v "$PWD/frontend":/app -w /app node:22-alpine \
                    sh -c "npm ci && npm test --if-present"
                '''
            }
        }

        stage('Build and deploy AgriPulse') {
            steps {
                sh '''
                  docker compose --env-file /home/user/Downloads/AgriPulse-updated/.env -p agripulse-main up --build --wait
                  curl --fail --silent --show-error --max-time 10 http://127.0.0.1:5174/login -o /dev/null
                '''
            }
        }

        stage('Build Image') {
            steps {
                sh "docker build -t=YOUR_DOCKERHUB_USERNAME/agripulse-backend ./backend"
                sh "docker build -t=YOUR_DOCKERHUB_USERNAME/agripulse-frontend ./frontend"
            }
        }

        stage('Push Image') {
            environment {
                DOCKER_HUB = credentials('docker-hub-creds')
            }
            steps {
                sh 'echo ${DOCKER_HUB_PSW} | docker login -u ${DOCKER_HUB_USR} --password-stdin'
                sh "docker push YOUR_DOCKERHUB_USERNAME/agripulse-backend"
                sh "docker push YOUR_DOCKERHUB_USERNAME/agripulse-frontend"
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
    }
                
    }

