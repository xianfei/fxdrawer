//
//   Java fx for C adapter library
//   Written under ANSI C by xianfei
//   王衔飞, sse of BUPT
//
//   Version 0.0.1 (alpha for insider)
//

#ifndef XIANFEI_DRAWER_H
#define XIANFEI_DRAWER_H

#ifdef _WIN32
const char* jarLoc = "./untitled.jar";
#else
const char *jarLoc = "../untitled.jar";
#endif

const char *versionStr="Java fx for C adapter library by xianfei v0.0.1 \n";

#ifdef _WIN32
#ifndef _WINSOCK_DEPRECATED_NO_WARNINGS
#define _WINSOCK_DEPRECATED_NO_WARNINGS
#endif
#ifndef _CRT_SECURE_NO_WARNINGS
#define _CRT_SECURE_NO_WARNINGS
#endif
#pragma warning (disable : 4996)
#pragma comment(lib, "ws2_32.lib")
#endif

// json support
#include "cJSON.h"

// throwing exception in c++
#ifdef __cplusplus
#include <stdexcept>
#include <exception>
#include <cstdio>
#include <cstdlib>
#else

#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

#endif

// exception handling
#ifdef __cplusplus
#define _ERROR(what) throw std::runtime_error((what))
#else
#define _ERROR(what) if(1){fputs((what),stderr); \
fputc('\n',stderr); \
assert(0);}
#endif

#ifdef _WIN32
#undef UNICODE
#define UNICODE
#undef _WINSOCKAPI_
#define _WINSOCKAPI_
#include <windows.h>
#include <winsock2.h>
#define close(sockdep) closesocket(sockdep)
#else

#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>

#endif

const char *fxServer = "localhost";
int fxPort = 6666;

typedef int objID; // Object ID -  a descriptor referencing the fx object
int sd; // a descriptor referencing the socket
#define BUFFLEN 512
char buf[BUFFLEN]; // buffer storing the string which received or will send
// the buf in socket : low 16bit for string length, buf+2 is string content


int sendJson(cJSON *jsonObj) {
    char *str = cJSON_Print(jsonObj); // json to string
    int i = 0, j = 2;
    if (str == NULL)_ERROR("error json format");
    for (i = 0; str[i]; ++i) buf[j++] = str[i];
    // for java readUtf() first 2 byte is length of str
    buf[0] = (unsigned char) ((j - 2) >> 8);
    buf[1] = (unsigned char) ((j - 2) % (1 << 8));
    free(str); // delete str
    send(sd, buf, j, 0); // send message
    memset(buf, 0, BUFFLEN); // reset buffer
    recv(sd, buf, sizeof(buf), 0); // receive returned message (cause blocking)
#ifdef _VERBOSE_MODE
    printf("%s\n", buf + 2); // output received message
#endif
    return 0;
}

int closeDrawer() {
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "exit");
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    close(sd);
#ifdef _WIN32
    WSACleanup();
#endif
    return 0;
};

struct Color {
    int r, g, b;
    double a;
} colorSet;

int initDrawer(int width, int height) {
    colorSet.r = 0;
    colorSet.g = 0;
    colorSet.b = 0;
    colorSet.a = 0.8;

    // create java vm for javafx
    // self kill if javafx window closed. On Windows by passing PID and kill. On unix by fork itself as child.
    if (strcmp(fxServer, "localhost") == 0) {
#ifdef _WIN32
        char szCommandLine[64];
#ifdef _VERBOSE_MODE
      sprintf(szCommandLine, "java -jar %s -port %d -verbose true -kill %d", jarLoc, fxPort, GetCurrentProcessId());
#else
      sprintf(szCommandLine, "java -jar %s -port %d -verbose false -kill %d", jarLoc, fxPort, GetCurrentProcessId());
#endif
      WinExec(szCommandLine, SW_SHOWNORMAL);
#else
        char portStr[6];
        sprintf(portStr, "%d", fxPort);
        if (fork()) {
#ifdef _VERBOSE_MODE
            execlp("java", "java", "-jar", jarLoc,"-port",portStr,"-verbose","true", (char *) 0);
#else
            execlp("java", "java", "-jar", jarLoc, "-port", portStr, "-verbose", "false", (char *) 0);
#endif
            exit(0);
        }
#endif
    }
    struct sockaddr_in server;
    struct hostent *sp;
    // win32 wsa2.2 for socket
#ifdef _WIN32
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa))_ERROR("WSA Error");  // winsock 2.2
#endif
    int connected; // do nothing while connect is available
#ifdef _VERBOSE_MODE
printf(versionStr);
#endif
    do {
#ifndef _WIN32
        usleep(10000); // wait 10 ms
#else
        Sleep(10);
#endif
        sd = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);
        memset((char *) &server, 0, sizeof(struct sockaddr_in));
        server.sin_family = AF_INET;
        server.sin_port = htons((u_short) fxPort);
        sp = gethostbyname(fxServer);
        memcpy(&server.sin_addr, sp->h_addr, sp->h_length);
        connected = connect(sd, (struct sockaddr *) &server, sizeof(struct sockaddr_in));
    } while (connected == -1);
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "init");
    cJSON_AddNumberToObject(jsonObj, "width", width);
    cJSON_AddNumberToObject(jsonObj, "height", height);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    return 0;
}

void setColor(int r, int g, int b, double a) {
    colorSet.r = r;
    colorSet.g = g;
    colorSet.b = b;
    colorSet.a = a;
}

objID drawCircle(int x, int y, int radius) {
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "draw");
    cJSON_AddStringToObject(jsonObj, "shape", "circle");
    cJSON_AddNumberToObject(jsonObj, "x", x);
    cJSON_AddNumberToObject(jsonObj, "y", y);
    cJSON_AddNumberToObject(jsonObj, "r", radius);
    cJSON_AddNumberToObject(jsonObj, "color-r", colorSet.r);
    cJSON_AddNumberToObject(jsonObj, "color-g", colorSet.g);
    cJSON_AddNumberToObject(jsonObj, "color-b", colorSet.b);
    cJSON_AddNumberToObject(jsonObj, "color-a", colorSet.a);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    objID id=-1;
    sscanf(buf+2,"ok%d",&id);
    return id;
}

objID drawRectangle(int x, int y, int width, int height) {
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "draw");
    cJSON_AddStringToObject(jsonObj, "shape", "rectangle");
    cJSON_AddNumberToObject(jsonObj, "x", x);
    cJSON_AddNumberToObject(jsonObj, "y", y);
    cJSON_AddNumberToObject(jsonObj, "w", width);
    cJSON_AddNumberToObject(jsonObj, "h", height);
    cJSON_AddNumberToObject(jsonObj, "color-r", colorSet.r);
    cJSON_AddNumberToObject(jsonObj, "color-g", colorSet.g);
    cJSON_AddNumberToObject(jsonObj, "color-b", colorSet.b);
    cJSON_AddNumberToObject(jsonObj, "color-a", colorSet.a);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    objID id=-1;
    sscanf(buf+2,"ok%d",&id);
    return id;
}

objID drawPolygon(int numberOfPoints, int *xArray, int *yArray) {
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "draw");
    cJSON_AddStringToObject(jsonObj, "shape", "polygon");
    cJSON_AddItemToObject(jsonObj, "x-array", cJSON_CreateIntArray(xArray, numberOfPoints));
    cJSON_AddItemToObject(jsonObj, "y-array", cJSON_CreateIntArray(yArray, numberOfPoints));
    cJSON_AddNumberToObject(jsonObj, "points", numberOfPoints);
    cJSON_AddNumberToObject(jsonObj, "color-r", colorSet.r);
    cJSON_AddNumberToObject(jsonObj, "color-g", colorSet.g);
    cJSON_AddNumberToObject(jsonObj, "color-b", colorSet.b);
    cJSON_AddNumberToObject(jsonObj, "color-a", colorSet.a);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    objID id=-1;
    sscanf(buf+2,"ok%d",&id);
    return id;
}

objID putText(int x,int y,const char* stringContext,double size){
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "add");
    cJSON_AddStringToObject(jsonObj, "object", "label");
    cJSON_AddNumberToObject(jsonObj, "x", x);
    cJSON_AddNumberToObject(jsonObj, "y", y);
    cJSON_AddStringToObject(jsonObj, "str", stringContext);
    cJSON_AddNumberToObject(jsonObj, "color-r", colorSet.r);
    cJSON_AddNumberToObject(jsonObj, "color-g", colorSet.g);
    cJSON_AddNumberToObject(jsonObj, "color-b", colorSet.b);
    cJSON_AddNumberToObject(jsonObj, "color-a", colorSet.a);
    cJSON_AddNumberToObject(jsonObj, "size", size);

    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    objID id=-1;
    sscanf(buf+2,"ok%d",&id);
    return id;
}

void changeText(objID id,const char* stringContext){
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "change");
    cJSON_AddStringToObject(jsonObj, "object", "str");
    cJSON_AddNumberToObject(jsonObj, "id", id);
    cJSON_AddStringToObject(jsonObj, "str", stringContext);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
}

void getText(objID id,char* stringBuffer){
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "get");
    cJSON_AddStringToObject(jsonObj, "object", "str");
    cJSON_AddNumberToObject(jsonObj, "id", id);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    if(buf[2]=='o')strcpy(stringBuffer,buf+4);
}

void removeByID(objID id){
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "delete");
    cJSON_AddNumberToObject(jsonObj, "id", id);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
}

objID waitForClick(){
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "get");
    cJSON_AddStringToObject(jsonObj, "object", "wait-click");
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    objID id=-1;
    sscanf(buf+2,"ok%d",&id);
    return id;
}

objID putButton(int x, int y, int width, int height,const char* stringContext){
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "add");
    cJSON_AddStringToObject(jsonObj, "object", "button");
    cJSON_AddStringToObject(jsonObj, "str", stringContext);
    cJSON_AddNumberToObject(jsonObj, "x", x);
    cJSON_AddNumberToObject(jsonObj, "y", y);
    cJSON_AddNumberToObject(jsonObj, "w", width);
    cJSON_AddNumberToObject(jsonObj, "h", height);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    objID id=-1;
    sscanf(buf+2,"ok%d",&id);
    return id;
}

objID putInputBox(int x, int y, int width, int height){
    cJSON *jsonObj;
    jsonObj = cJSON_CreateObject();
    cJSON_AddStringToObject(jsonObj, "action", "add");
    cJSON_AddStringToObject(jsonObj, "object", "input");
    cJSON_AddNumberToObject(jsonObj, "x", x);
    cJSON_AddNumberToObject(jsonObj, "y", y);
    cJSON_AddNumberToObject(jsonObj, "w", width);
    cJSON_AddNumberToObject(jsonObj, "h", height);
    sendJson(jsonObj);
    cJSON_Delete(jsonObj);
    objID id=-1;
    sscanf(buf+2,"ok%d",&id);
    return id;
}


#endif //XIANFEI_DRAWER_H
