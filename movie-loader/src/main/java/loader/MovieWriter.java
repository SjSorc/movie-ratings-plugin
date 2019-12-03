package loader;

import java.util.concurrent.CountDownLatch;

import com.mongodb.BasicDBObject;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;

import loader.domain.Title;

public class MovieWriter implements Runnable{
	private MovieQueue queue;
	private MongoClient mongo;
	private CountDownLatch latch;
	private String type;
	
	public MovieWriter(MovieQueue queue, MongoClient mongo, CountDownLatch latch, String type) {
		this.queue = queue;
		this.mongo = mongo;
		this.latch = latch;
		this.type = type;
	}

	private DBObject getRatingDocument(Title t) {
		BasicDBObjectBuilder docBuilder = BasicDBObjectBuilder.start();							
		docBuilder.append("_id", t.getTconst());
		docBuilder.append("averageRating", t.getAverageRating());
		docBuilder.append("numVotes", t.getNumVotes());
		return docBuilder.get();
	}
	
	private DBObject getSearchDocument(Title t) {
		BasicDBObjectBuilder docBuilder = BasicDBObjectBuilder.start();							
		docBuilder.append("_id", t.getTconst());
		return docBuilder.get();
	}
	
	private DBObject getTitleDocument(Title t) {
		BasicDBObjectBuilder docBuilder = BasicDBObjectBuilder.start();							
		docBuilder.append("startYear", t.getStartYear());
		docBuilder.append("primaryTitle", t.getPrimaryTitle());
		docBuilder.append("originalTitle", t.getOriginalTitle());
		docBuilder.append("genres", t.getGenres());	
		return new BasicDBObject().append("$set", docBuilder.get());
	}
	
	private boolean shouldInsertRatings(Title t) {
		return t.getNumVotes() > 500;
	}
	
	@Override
	public void run() {
		DB db = mongo.getDB("imdb");  
        DBCollection titles = db.getCollection("titles");
        
		while(!queue.isDone()) {
			Title t = queue.get();
			
			if(type == "RATINGS" && shouldInsertRatings(t)) {
				DBObject doc = getRatingDocument(t);
				titles.insert(doc);				
			} else {
				DBObject searchQuery = getSearchDocument(t);
				DBObject doc = getTitleDocument(t);
				titles.update(searchQuery, doc);
			}
		}
		System.out.println("Writing done");
		latch.countDown();
	}

}

