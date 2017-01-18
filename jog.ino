
// id for json
char id[] = "jog";



// default delay for sending messages
int d; 
int normalDelay = 100;
int sleepDelay = 1000;

// range for sensitivity
int range[] = {500, 520};

int x;
int y;

// cycle trough analoRead
int c = 10;

// if in normal position use time counter 
// to increase delay between messages
unsigned long sleepTime;
unsigned long lastCommand;
unsigned long lastSent;
boolean sleeping;


void setup() {

 Serial.begin(115200);
 sleeping = true;
 
}

void loop() { 
  readInputs();
  checkInputs();
  Send();
}

void Send(){

   if (sleeping){
    if (millis() - lastSent  > sleepDelay){
        sendJson();
        lastSent = millis();
    } 
  }
  else{
    if (millis() - lastSent  > normalDelay){
       sendJson();
       lastSent = millis();
    }
  }

}
void checkInputs(){
  if (x > range[0] && x < range[1] && y > range[0] && y < range[1]){
      // we are in stand-by mode
      // waiting x3 normalDelay before going in sleep mode
      if ( millis() - lastCommand  > normalDelay * 3){
        sleeping = true;
      }
  }
  else{
      // we are getting movements
      sleeping = false;
      lastCommand = millis();
  }
}
void readInputs(){

  x=0;
  y=0;
  for (int i = 1; i <= c; i++) {
    x += analogRead(A0);
  }
  x = x/c;
  
  for (int i = 1; i <= c; i++) {
    y += analogRead(A1);
  }
  y = y/c;

  
}
void sendJson(){
  Serial.println("{id: '"+String(id)+"', x: " + String(x) + ", y: "+ String(y) +"}");  
}
