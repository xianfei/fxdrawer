cmake_minimum_required(VERSION 3.15)
project(c_drawer C)

set(CMAKE_C_STANDARD 99)

add_executable(c_drawer main.c drawer.h cJSON.c cJSON.h)