FROM --platform=linux/amd64 python:3.9

WORKDIR /app

COPY requirements.txt /app

RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 3000

CMD ["python3", "app.py"]