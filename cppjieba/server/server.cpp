#include <unistd.h>
#include <algorithm>
#include <string>
#include <ctype.h>
#include <string.h>
#include "Limonp/Config.hpp"
#include "Husky/EpollServer.hpp"
#include "MPSegment.hpp"
#include "HMMSegment.hpp"
#include "MixSegment.hpp"
#include "KeywordExtractor.hpp"
using namespace Husky;
using namespace CppJieba;

class ReqHandler: public IRequestHandler
{
    public:
        ReqHandler(const string& dictPath, const string& modelPath, const string& userDictPath,const string& idfPath,const string& stopWordPath){
			_extractor.init(dictPath,modelPath,idfPath,stopWordPath,userDictPath);
		
		};
        virtual ~ReqHandler(){};
    public:
        virtual bool do_GET(const HttpReqInfo& httpReq, string& strSnd) const
        {
            string sentence, tmp;
            vector<string> words;
            httpReq.GET("key", tmp); 
            URLDecode(tmp, sentence);
            _extractor._segment.cut(sentence, words);
            if(httpReq.GET("format", tmp) && tmp == "simple")
            {
                join(words.begin(), words.end(), strSnd, " ");
                return true;
            }else if(httpReq.GET("type",tmp) && tmp == "keyword"){
				
				vector<pair<string, double> > wordweights;
				vector<string> words;
				size_t topN = 50;
				_extractor.extract(sentence, wordweights, topN);
				strSnd << wordweights;
				//extractor.extract(s, words, topN);
				//cout<< s << '\n' << words << endl;
				return true;
			}
            strSnd << words;
            return true;
        }
        virtual bool do_POST(const HttpReqInfo& httpReq, string& strSnd) const
        {
            vector<string> words;
			vector<pair<string, double> > wordweights;
			size_t topN = 50;
			_extractor.extract(httpReq.getBody(), wordweights, topN);
			strSnd << wordweights;
            //_extractor._segment.cut(httpReq.getBody(), words);
            return true;
        }
    private:
		KeywordExtractor _extractor;
};

bool run(int argc, char** argv)
{
    if(argc < 2)
    {
        return false;
    }
    Config conf(argv[1]);
    if(!conf)
    {
        return false;
    }
    size_t port = 0;
    string dictPath;
    string modelPath;
    string userDictPath;
    string idfPath;
    string stopWordPath;
    string val;
    if(!conf.get("port", val))
    {
        LogFatal("conf get port failed.");
        return false;
    }
    port = atoi(val.c_str());

    if(!conf.get("dict_path", dictPath))
    {
        LogFatal("conf get dict_path failed.");
        return false;
    }
    if(!conf.get("model_path", modelPath))
    {
        LogFatal("conf get model_path failed.");
        return false;
    }
    if(!conf.get("idf_path", idfPath))
    {
        LogFatal("conf get idf_path failed.");
        return false;
    }
    if(!conf.get("stopword_path", stopWordPath))
    {
        LogFatal("conf get stopword_path failed.");
        return false;
    }

    if(!conf.get("user_dict_path", userDictPath)) //optional
    {
        userDictPath = "";
    }

    ReqHandler reqHandler(dictPath, modelPath, userDictPath,idfPath,stopWordPath);
    EpollServer sf(port, reqHandler);
    return sf.start();
}

int main(int argc, char* argv[])
{
    if(!run(argc, argv))
    {
        printf("usage: %s <config_file>\n", argv[0]);
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

