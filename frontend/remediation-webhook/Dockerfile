FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
RUN mkdir -p /var/log && touch /var/log/remediation.log
EXPOSE 5000
CMD ["python", "app.py"]