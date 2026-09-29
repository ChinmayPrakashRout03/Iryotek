package com.hms.entity;

import java.sql.Timestamp;

public class Blog {
	private int id;
	private String title;
	private String excerpt;
	private String content;
	private String author;
	private String category;
	private String imagePath;
	private int commentCount;
	private Timestamp createdAt;

	public Blog() {
	}

	public Blog(String title, String excerpt, String content, String author, String category, String imagePath, int commentCount) {
		this.title = title;
		this.excerpt = excerpt;
		this.content = content;
		this.author = author;
		this.category = category;
		this.imagePath = imagePath;
		this.commentCount = commentCount;
	}

	public Blog(int id, String title, String excerpt, String content, String author, String category, String imagePath, int commentCount, Timestamp createdAt) {
		this.id = id;
		this.title = title;
		this.excerpt = excerpt;
		this.content = content;
		this.author = author;
		this.category = category;
		this.imagePath = imagePath;
		this.commentCount = commentCount;
		this.createdAt = createdAt;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getExcerpt() {
		return excerpt;
	}

	public void setExcerpt(String excerpt) {
		this.excerpt = excerpt;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}

	public int getCommentCount() {
		return commentCount;
	}

	public void setCommentCount(int commentCount) {
		this.commentCount = commentCount;
	}

	public Timestamp getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
		this.createdAt = createdAt;
	}
}
