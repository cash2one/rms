#include <node.h>
#include <v8.h>

#include "nan.h"
#include "CppJieba/MixSegment.hpp"
#include "CppJieba/KeywordExtractor.hpp"

using namespace v8;

CppJieba::MixSegment segment;
CppJieba::KeywordExtractor keywordextractor;

NAN_METHOD(cut) {
    NanScope();

    String::Utf8Value param1(args[0]->ToString());
    std::string wordsStr;
    std::vector<std::string> words;

    segment.cut(*param1, words);
    wordsStr << words;

    NanReturnValue(String::New(wordsStr.c_str()));
}
NAN_METHOD(extract) {
    NanScope();

    String::Utf8Value param1(args[0]->ToString());
    size_t topN=args[1]->Int32Value();
    if(topN<1) topN=10;
    std::string wordsStr;
    std::vector<std::string> words;

    keywordextractor.extract(*param1, words,topN);
    wordsStr << words;

    NanReturnValue(String::New(wordsStr.c_str()));
}

NAN_METHOD(loadDict) {
    NanScope();
    String::Utf8Value param0(args[0]->ToString());
    String::Utf8Value param1(args[1]->ToString());
    NanReturnValue(Boolean::New(segment.init(*param0, *param1)));
}
NAN_METHOD(loadKeywordDict) {
    NanScope();
    String::Utf8Value param0(args[0]->ToString());
    String::Utf8Value param1(args[1]->ToString());
    String::Utf8Value param2(args[2]->ToString());
    String::Utf8Value param3(args[3]->ToString());
    NanReturnValue(Boolean::New(keywordextractor.init(*param0, *param1,*param2,*param3)));
}

void init(Handle<Object> exports) {
    exports->Set(String::NewSymbol("loadDict"),
                FunctionTemplate::New(loadDict)->GetFunction());
    exports->Set(String::NewSymbol("cut"),
                FunctionTemplate::New(cut)->GetFunction());
    exports->Set(String::NewSymbol("extract"),
                FunctionTemplate::New(extract)->GetFunction());
    exports->Set(String::NewSymbol("loadKeywordDict"),
                FunctionTemplate::New(loadKeywordDict)->GetFunction());
}

NODE_MODULE(segment, init)
